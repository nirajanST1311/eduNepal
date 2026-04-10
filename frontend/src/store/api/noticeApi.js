import { apiSlice } from "./apiSlice";

export const noticeApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getNotices: build.query({
      query: (params) => ({ url: "/notices", params }),
      transformResponse: (res) =>
        Array.isArray(res) ? res : res.notices || [],
      providesTags: ["Notices"],
    }),
    getNoticesPaginated: build.query({
      query: ({ page = 1, limit = 20, search, category, from } = {}) => ({
        url: "/notices",
        params: {
          page,
          limit,
          ...(search && { search }),
          ...(category && { category }),
          ...(from && { from }),
        },
      }),
      providesTags: ["Notices"],
    }),
    createNotice: build.mutation({
      query: (body) => ({ url: "/notices", method: "POST", body }),
      invalidatesTags: ["Notices"],
    }),
    deleteNotice: build.mutation({
      query: (id) => ({ url: `/notices/${id}`, method: "DELETE" }),
      invalidatesTags: ["Notices"],
    }),
  }),
});

export const {
  useGetNoticesQuery,
  useGetNoticesPaginatedQuery,
  useCreateNoticeMutation,
  useDeleteNoticeMutation,
} = noticeApi;
