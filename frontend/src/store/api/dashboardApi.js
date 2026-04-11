import { apiSlice } from "./apiSlice";

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getPublicStats: build.query({
      query: () => "/dashboard/public-stats",
    }),
    getDashboardStats: build.query({
      query: () => "/dashboard/stats",
      providesTags: ["Dashboard"],
    }),
    getSuperadminStats: build.query({
      query: () => "/dashboard/superadmin",
      providesTags: ["Dashboard"],
    }),
    getSuperadminAnalytics: build.query({
      query: ({
        page = 1,
        limit = 20,
        search = "",
        sortBy = "name",
        sortOrder = "asc",
      } = {}) => ({
        url: "/dashboard/superadmin/analytics",
        params: { page, limit, search, sortBy, sortOrder },
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetPublicStatsQuery,
  useGetDashboardStatsQuery,
  useGetSuperadminStatsQuery,
  useGetSuperadminAnalyticsQuery,
} = dashboardApi;
