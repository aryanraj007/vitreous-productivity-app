const router = require("express").Router();
const Task = require("../models/task");
const { authenticateToken } = require("./auth");

/**
 * Dynamic Priority Scoring Algorithm
 * PriorityScore = 1 / (Deadline - CurrentTime)
 * If CurrentTime > Deadline and status !== "Completed" → Overdue (Highest Priority)
 */
function calculatePriority(task) {
    const now = Date.now();
    const deadline = new Date(task.deadline).getTime();
    const diff = deadline - now;

    if (diff <= 0 && task.status !== "Completed") {
        // Overdue – assign highest priority
        // Using MAX_SAFE_INTEGER instead of Infinity because JSON cannot serialize Infinity
        return {
            priorityScore: Number.MAX_SAFE_INTEGER,
            priorityLabel: "Overdue",
            isOverdue: true,
        };
    }

    if (task.status === "Completed") {
        return {
            priorityScore: 0,
            priorityLabel: "Completed",
            isOverdue: false,
        };
    }

    const score = 1 / diff;
    let label = "Low";
    // Thresholds: < 1 day = Critical, < 3 days = High, < 7 days = Medium
    const oneDay = 86400000;
    if (diff < oneDay) label = "Critical";
    else if (diff < 3 * oneDay) label = "High";
    else if (diff < 7 * oneDay) label = "Medium";

    return {
        priorityScore: score,
        priorityLabel: label,
        isOverdue: false,
    };
}

/**
 * GET /api/tasks
 * Fetch all tasks for the authenticated user with dynamic priority scoring.
 * Pre-sorted by priorityScore descending.
 */
router.get("/", authenticateToken, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).lean();

        // Calculate dynamic priority for each task
        const tasksWithPriority = tasks.map((task) => {
            const priority = calculatePriority(task);
            return {
                ...task,
                priorityScore: priority.priorityScore,
                priorityLabel: priority.priorityLabel,
                isOverdue: priority.isOverdue,
            };
        });

        // Sort by priorityScore descending (highest priority first)
        tasksWithPriority.sort((a, b) => b.priorityScore - a.priorityScore);

        return res.status(200).json({ data: tasksWithPriority });
    } catch (error) {
        console.error("Get tasks error:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
});

/**
 * POST /api/tasks
 * Create a new task. Emits a socket event for real-time sync.
 */
router.post("/", authenticateToken, async (req, res) => {
    try {
        const { title, description, category, status, deadline } = req.body;

        if (!title || !description || !category || !deadline) {
            return res.status(400).json({ message: "Title, description, category, and deadline are required." });
        }

        const newTask = new Task({
            title,
            description,
            category,
            status: status || "Pending",
            deadline: new Date(deadline),
            user: req.user.id,
        });

        const savedTask = await newTask.save();
        const taskObj = savedTask.toObject();
        const priority = calculatePriority(taskObj);

        const taskWithPriority = {
            ...taskObj,
            priorityScore: priority.priorityScore,
            priorityLabel: priority.priorityLabel,
            isOverdue: priority.isOverdue,
        };

        // Emit socket event for real-time sync
        const io = req.app.get("io");
        if (io) {
            io.to(req.user.id).emit("task:created", taskWithPriority);
        }

        return res.status(201).json({ message: "Task created.", data: taskWithPriority });
    } catch (error) {
        console.error("Create task error:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
});

/**
 * PUT /api/tasks/:id
 * Update a task. Emits a socket event for real-time sync.
 */
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, status, deadline } = req.body;

        const task = await Task.findOne({ _id: id, user: req.user.id });
        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (category !== undefined) task.category = category;
        if (status !== undefined) task.status = status;
        if (deadline !== undefined) task.deadline = new Date(deadline);

        const updatedTask = await task.save();
        const taskObj = updatedTask.toObject();
        const priority = calculatePriority(taskObj);

        const taskWithPriority = {
            ...taskObj,
            priorityScore: priority.priorityScore,
            priorityLabel: priority.priorityLabel,
            isOverdue: priority.isOverdue,
        };

        // Emit socket event for real-time sync
        const io = req.app.get("io");
        if (io) {
            io.to(req.user.id).emit("task:updated", taskWithPriority);
        }

        return res.status(200).json({ message: "Task updated.", data: taskWithPriority });
    } catch (error) {
        console.error("Update task error:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task. Emits a socket event for real-time sync.
 */
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findOneAndDelete({ _id: id, user: req.user.id });
        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        // Emit socket event for real-time sync
        const io = req.app.get("io");
        if (io) {
            io.to(req.user.id).emit("task:deleted", { _id: id });
        }

        return res.status(200).json({ message: "Task deleted." });
    } catch (error) {
        console.error("Delete task error:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
});

module.exports = router;
