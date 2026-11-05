import {
  Customer,
  CustomerSalesStat,
  Product,
  ProductSalesStat,
  ReportFilter,
  Sale,
} from "@/types";

export interface AnalyticsSummary {
  filteredSales: Sale[];
  totalRevenue: number;
  totalQuantity: number;
  totalOrders: number;
  averageOrderValue: number;
  genderMetrics: {
    maleRevenue: number;
    femaleRevenue: number;
    otherRevenue: number;
    maleOrders: number;
    femaleOrders: number;
    otherOrders: number;
    maleJuicesCount: number;
    femaleJuicesCount: number;
  };
  productStats: ProductSalesStat[];
  customerStats: CustomerSalesStat[];
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    revenue: number;
    quantity: number;
  }[];
  topSellingProduct: ProductSalesStat | null;
  topCustomer: CustomerSalesStat | null;
  dailyTimeline: {
    date: string;
    revenue: number;
    quantity: number;
    orderCount: number;
  }[];
}

export function computeAnalytics(
  sales: Sale[],
  customers: Customer[],
  products: Product[],
  filter: ReportFilter
): AnalyticsSummary {
  const now = new Date();

  // 1. Filter sales by Date
  const dateFiltered = sales.filter((sale) => {
    const saleDate = new Date(sale.date);

    if (filter.datePreset === "all") return true;

    if (filter.datePreset === "today") {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return saleDate >= todayStart;
    }

    if (filter.datePreset === "yesterday") {
      const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return saleDate >= yesterdayStart && saleDate < yesterdayEnd;
    }

    if (filter.datePreset === "last7days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return saleDate >= sevenDaysAgo;
    }

    if (filter.datePreset === "last30days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return saleDate >= thirtyDaysAgo;
    }

    if (filter.datePreset === "custom") {
      if (filter.startDate) {
        const start = new Date(filter.startDate);
        if (saleDate < start) return false;
      }
      if (filter.endDate) {
        const end = new Date(filter.endDate);
        end.setHours(23, 59, 59, 999);
        if (saleDate > end) return false;
      }
      return true;
    }

    return true;
  });

  // 2. Filter by Gender
  const genderFiltered = dateFiltered.filter((sale) => {
    if (!filter.gender || filter.gender === "all") return true;
    return sale.customerGender.toLowerCase() === filter.gender.toLowerCase();
  });

  // 3. Filter by Category & Product (at item level)
  const filteredSales: Sale[] = [];

  genderFiltered.forEach((sale) => {
    const matchingItems = sale.items.filter((item) => {
      if (filter.categoryId && filter.categoryId !== "all") {
        if (item.categoryId !== filter.categoryId) return false;
      }
      if (filter.productId && filter.productId !== "all") {
        if (item.productId !== filter.productId) return false;
      }
      return true;
    });

    if (matchingItems.length > 0) {
      // Create a scoped sale representation for accurate item-specific math
      const scopedSubtotal = matchingItems.reduce((acc, it) => acc + it.total, 0);
      // Proportionate discount calculation
      const itemRatio = sale.subtotal > 0 ? scopedSubtotal / sale.subtotal : 1;
      const scopedDiscount = sale.discount * itemRatio;
      const scopedTotal = Math.max(0, scopedSubtotal - scopedDiscount);

      filteredSales.push({
        ...sale,
        items: matchingItems,
        subtotal: scopedSubtotal,
        discount: scopedDiscount,
        total: scopedTotal,
      });
    }
  });

  // 4. Summaries
  let totalRevenue = 0;
  let totalQuantity = 0;
  const totalOrders = filteredSales.length;

  const genderMetrics = {
    maleRevenue: 0,
    femaleRevenue: 0,
    otherRevenue: 0,
    maleOrders: 0,
    femaleOrders: 0,
    otherOrders: 0,
    maleJuicesCount: 0,
    femaleJuicesCount: 0,
  };

  // Maps for aggregation
  const productStatsMap: Record<string, ProductSalesStat> = {};
  const customerStatsMap: Record<string, CustomerSalesStat> = {};
  const categoryMap: Record<
    string,
    { name: string; revenue: number; quantity: number }
  > = {};
  const timelineMap: Record<
    string,
    { revenue: number; quantity: number; orderCount: number }
  > = {};

  filteredSales.forEach((sale) => {
    totalRevenue += sale.total;

    // Gender aggregation
    if (sale.customerGender === "male") {
      genderMetrics.maleRevenue += sale.total;
      genderMetrics.maleOrders += 1;
    } else if (sale.customerGender === "female") {
      genderMetrics.femaleRevenue += sale.total;
      genderMetrics.femaleOrders += 1;
    } else {
      genderMetrics.otherRevenue += sale.total;
      genderMetrics.otherOrders += 1;
    }

    // Daily Timeline
    const dayKey = sale.date.split("T")[0];
    if (!timelineMap[dayKey]) {
      timelineMap[dayKey] = { revenue: 0, quantity: 0, orderCount: 0 };
    }
    timelineMap[dayKey].revenue += sale.total;
    timelineMap[dayKey].orderCount += 1;

    // Customer Aggregation
    if (!customerStatsMap[sale.customerId]) {
      const custObj = customers.find((c) => c.id === sale.customerId);
      customerStatsMap[sale.customerId] = {
        customerId: sale.customerId,
        customerName: sale.customerName,
        customerGender: sale.customerGender,
        customerPhone: sale.customerPhone || custObj?.phone,
        customerInstagram: sale.customerInstagram || custObj?.instagramId,
        totalOrders: 0,
        totalQuantity: 0,
        totalSpent: 0,
        lastPurchaseDate: sale.date,
        purchasedProducts: [],
        favoriteProduct: "N/A",
      };
    }
    const cStat = customerStatsMap[sale.customerId];
    cStat.totalOrders += 1;
    cStat.totalSpent += sale.total;
    if (new Date(sale.date) > new Date(cStat.lastPurchaseDate)) {
      cStat.lastPurchaseDate = sale.date;
    }

    // Items loop
    sale.items.forEach((item) => {
      totalQuantity += item.quantity;
      timelineMap[dayKey].quantity += item.quantity;

      if (sale.customerGender === "male") {
        genderMetrics.maleJuicesCount += item.quantity;
      } else if (sale.customerGender === "female") {
        genderMetrics.femaleJuicesCount += item.quantity;
      }

      // Customer item log
      cStat.totalQuantity += item.quantity;
      const existingCustItem = cStat.purchasedProducts.find(
        (p) => p.productId === item.productId && p.variantName === item.variantName
      );
      if (existingCustItem) {
        existingCustItem.quantity += item.quantity;
        if (!existingCustItem.dates.includes(dayKey)) {
          existingCustItem.dates.push(dayKey);
        }
      } else {
        cStat.purchasedProducts.push({
          productId: item.productId,
          productName: item.productName,
          variantName: item.variantName,
          quantity: item.quantity,
          dates: [dayKey],
        });
      }

      // Category map
      if (!categoryMap[item.categoryId]) {
        categoryMap[item.categoryId] = {
          name: item.categoryName,
          revenue: 0,
          quantity: 0,
        };
      }
      categoryMap[item.categoryId].revenue += item.total;
      categoryMap[item.categoryId].quantity += item.quantity;

      // Product Stats Map
      if (!productStatsMap[item.productId]) {
        const prod = products.find((p) => p.id === item.productId);
        productStatsMap[item.productId] = {
          productId: item.productId,
          productName: item.productName,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          emoji: prod?.emoji || "",
          totalQuantity: 0,
          totalRevenue: 0,
          maleBuyersQty: 0,
          femaleBuyersQty: 0,
          otherBuyersQty: 0,
          orderCount: 0,
          variantBreakdown: {},
        };
      }

      const pStat = productStatsMap[item.productId];
      pStat.totalQuantity += item.quantity;
      pStat.totalRevenue += item.total;
      pStat.orderCount += 1;

      if (sale.customerGender === "male") {
        pStat.maleBuyersQty += item.quantity;
      } else if (sale.customerGender === "female") {
        pStat.femaleBuyersQty += item.quantity;
      } else {
        pStat.otherBuyersQty += item.quantity;
      }

      pStat.variantBreakdown[item.variantName] =
        (pStat.variantBreakdown[item.variantName] || 0) + item.quantity;
    });
  });

  // Calculate favorite product for each customer
  Object.values(customerStatsMap).forEach((cStat) => {
    if (cStat.purchasedProducts.length > 0) {
      const sortedCustItems = [...cStat.purchasedProducts].sort(
        (a, b) => b.quantity - a.quantity
      );
      cStat.favoriteProduct = sortedCustItems[0].productName;
    }
  });

  // Product stats list and sorting
  let productStats = Object.values(productStatsMap);
  const sortBy = filter.sortBy || "qty_desc";

  productStats.sort((a, b) => {
    switch (sortBy) {
      case "qty_desc":
        return b.totalQuantity - a.totalQuantity;
      case "qty_asc":
        return a.totalQuantity - b.totalQuantity;
      case "revenue_desc":
        return b.totalRevenue - a.totalRevenue;
      case "revenue_asc":
        return a.totalRevenue - b.totalRevenue;
      default:
        return b.totalQuantity - a.totalQuantity;
    }
  });

  // Customer stats list sorted by spent desc
  const customerStats = Object.values(customerStatsMap).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  const categoryBreakdown = Object.entries(categoryMap).map(([id, val]) => ({
    categoryId: id,
    categoryName: val.name,
    revenue: val.revenue,
    quantity: val.quantity,
  }));

  const dailyTimeline = Object.entries(timelineMap)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, val]) => ({
      date,
      revenue: Math.round(val.revenue * 100) / 100,
      quantity: val.quantity,
      orderCount: val.orderCount,
    }));

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const topSellingProduct = productStats.length > 0 ? productStats[0] : null;
  const topCustomer = customerStats.length > 0 ? customerStats[0] : null;

  return {
    filteredSales,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalQuantity,
    totalOrders,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    genderMetrics: {
      ...genderMetrics,
      maleRevenue: Math.round(genderMetrics.maleRevenue * 100) / 100,
      femaleRevenue: Math.round(genderMetrics.femaleRevenue * 100) / 100,
      otherRevenue: Math.round(genderMetrics.otherRevenue * 100) / 100,
    },
    productStats,
    customerStats,
    categoryBreakdown,
    topSellingProduct,
    topCustomer,
    dailyTimeline,
  };
}
