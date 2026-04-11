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
      query: ({
        page = 1,
        limit = 20,
        search,
        category,
        from,
        scope,
        priority,
        classId,
        status,
      } = {}) => ({
        url: "/notices",
        params: {
          page,
          limit,
          ...(search && { search }),
          ...(category && { category }),
          ...(from && { from }),
          ...(scope && { scope }),
          ...(priority && { priority }),
          ...(classId && { classId }),
          ...(status && { status }),
        },
      }),
      providesTags: ["Notices"],
    }),
    createNotice: build.mutation({
      query: (body) => ({ url: "/notices", method: "POST", body }),
      invalidatesTags: ["Notices"],
    }),
    updateNotice: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/notices/${id}`,
        method: "PATCH",
        body,
      }),
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
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
} = noticeApi;
