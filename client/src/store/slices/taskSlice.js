import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// ─── Async Thunks ───────────────────────────────────────────────
export const fetchTasks = createAsyncThunk(
    "tasks/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/tasks");
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch tasks.");
        }
    }
);

export const createTask = createAsyncThunk(
    "tasks/create",
    async (taskData, { rejectWithValue }) => {
        try {
            const res = await api.post("/tasks", taskData);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to create task.");
        }
    }
);

export const updateTask = createAsyncThunk(
    "tasks/update",
    async ({ id, ...updates }, { rejectWithValue }) => {
        try {
            const res = await api.put(`/tasks/${id}`, updates);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to update task.");
        }
    }
);

export const deleteTask = createAsyncThunk(
    "tasks/delete",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/tasks/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to delete task.");
        }
    }
);

// ─── Initial State ──────────────────────────────────────────────
const initialState = {
    items: [],
    loading: false,
    error: null,
};

// ─── Slice ──────────────────────────────────────────────────────
const taskSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        // Socket.io real-time event handlers — instant Redux state updates
        socketTaskCreated(state, action) {
            // Avoid duplicates
            const exists = state.items.find((t) => t._id === action.payload._id);
            if (!exists) {
                state.items.unshift(action.payload);
                // Re-sort by priorityScore descending
                state.items.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
            }
        },
        socketTaskUpdated(state, action) {
            const idx = state.items.findIndex((t) => t._id === action.payload._id);
            if (idx !== -1) {
                state.items[idx] = action.payload;
            }
            // Re-sort after update
            state.items.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
        },
        socketTaskDeleted(state, action) {
            state.items = state.items.filter((t) => t._id !== action.payload._id);
        },
        clearTaskError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create
            .addCase(createTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTask.fulfilled, (state) => {
                state.loading = false;
                // The socket event will handle adding the task to state
            })
            .addCase(createTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update
            .addCase(updateTask.pending, (state) => {
                state.error = null;
            })
            .addCase(updateTask.fulfilled, (state) => {
                // The socket event will handle updating the task in state
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Delete
            .addCase(deleteTask.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteTask.fulfilled, (state) => {
                // The socket event will handle removing the task from state
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { socketTaskCreated, socketTaskUpdated, socketTaskDeleted, clearTaskError } =
    taskSlice.actions;
export default taskSlice.reducer;
