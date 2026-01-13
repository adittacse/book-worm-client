import api from "@/lib/api";

export const adminApi = {
    stats: async () => {
        const res = await api.get("/admin/stats");
        return res.data;
    },

    booksPerGenre: async () => {
        const res = await api.get("/admin/charts/books-per-genre");
        return res.data; // { labels, data, chart }
    },

    monthlyBooksRead: async (year) => {
        const res = await api.get(`/admin/charts/monthly-books-read?year=${year}`);
        return res.data; // { year, labels, data, chart }
    },

    monthlyPagesRead: async (year) => {
        const res = await api.get(`/admin/charts/pages-read-monthly?year=${year}`);
        return res.data; // { year, labels, data, chart }
    },
};
