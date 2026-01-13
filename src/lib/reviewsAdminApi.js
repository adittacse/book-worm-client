import api from "@/lib/api";

export const reviewsAdminApi = {
    pending: async () => {
        const res = await api.get("/reviews/pending");
        return res.data || [];
    },

    approvedAll: async () => {
        const res = await api.get("/admin/reviews/approved");
        return res.data || [];
    },

    approve: async (id) => {
        const res = await api.patch(`/reviews/${id}/approve`);
        return res.data;
    },

    remove: async (id) => {
        const res = await api.delete(`/reviews/${id}`);
        return res.data;
    },

    getBooksByIds: async (ids) => {
        const unique = [...new Set((ids || []).filter(Boolean))];
        if (unique.length === 0) return [];

        const results = await Promise.allSettled(
            unique.map((id) => api.get(`/books/${id}`))
        );

        return results
            .filter((r) => r.status === "fulfilled")
            .map((r) => r.value.data)
            .filter(Boolean);
    },
};
