import { apiSlice } from "./apiSlice";

export const schoolApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getSchools: build.query({
      query: () => "/schools",
      providesTags: ["Schools"],
    }),
    getSchoolsPaginated: build.query({
      query: ({ page = 1, limit = 20, search = "", status = "" } = {}) => ({
        url: "/schools",
        params: {
          page,
          limit,
          search,
          ...(status && status !== "all" ? { status } : {}),
        },
      }),
      providesTags: ["Schools"],
    }),
    getSchool: build.query({
      query: (id) => `/schools/${id}`,
      providesTags: (r, e, id) => [{ type: "Schools", id }],
    }),
    getSchoolStats: build.query({
      query: (id) => `/schools/${id}/stats`,
    }),
    createSchool: build.mutation({
      query: (body) => ({ url: "/schools", method: "POST", body }),
      invalidatesTags: ["Schools"],
    }),
    updateSchool: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/schools/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Schools"],
    }),
  }),
});

export const {
  useGetSchoolsQuery,
  useGetSchoolsPaginatedQuery,
  useGetSchoolQuery,
  useGetSchoolStatsQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
} = schoolApi;
