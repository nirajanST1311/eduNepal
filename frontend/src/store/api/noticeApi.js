import { apiSlice } from "./apiSlice";

export const noticeApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getNotices: build.query({
      query: (params) => ({ url: "/notices", params }),
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
  useCreateNoticeMutation,
  useDeleteNoticeMutation,
} = noticeApi;
