import axios, { type AxiosInstance } from "axios";
import type {
  KinguinBalance,
  KinguinDownloadKeysParams,
  KinguinKey,
  KinguinOrder,
  KinguinOrderSearchParams,
  KinguinOrderSearchResponse,
  KinguinPlaceOrderInput,
  KinguinProduct,
  KinguinProductSearchParams,
  KinguinProductSearchResponse,
  KinguinRegion,
  KinguinReturnKeyResult,
} from "@/types/kinguin";

class Kinguin {
  private readonly axiosInstance: AxiosInstance;

  constructor(apiKey?: string, apiBase?: string) {
    const resolvedApiKey = apiKey ?? process.env.KINGUIN_API_KEY;
    const resolvedApiBase = apiBase ?? process.env.KINGUIN_API_BASE;

    if (!resolvedApiKey || !resolvedApiBase) {
      throw new Error("KINGUIN_API_KEY and KINGUIN_API_BASE must be set");
    }

    this.axiosInstance = axios.create({
      baseURL: resolvedApiBase,
      headers: {
        "X-Api-Key": resolvedApiKey,
        "Content-Type": "application/json",
      },
    });
  }

  async searchProducts(params?: KinguinProductSearchParams) {
    const response = await this.axiosInstance.get<KinguinProductSearchResponse>(
      "/v1/products",
      { params },
    );
    return response.data;
  }

  async getProduct(productId: string) {
    const response = await this.axiosInstance.get<KinguinProduct>(
      `/v2/products/${productId}`,
    );
    return response.data;
  }

  async placeOrder(input: KinguinPlaceOrderInput) {
    const response = await this.axiosInstance.post<KinguinOrder>(
      "/v2/order",
      input,
    );
    return response.data;
  }

  async getOrder(orderId: string) {
    const response = await this.axiosInstance.get<KinguinOrder>(
      `/v1/order/${orderId}`,
    );
    return response.data;
  }

  async searchOrders(params?: KinguinOrderSearchParams) {
    const response = await this.axiosInstance.get<KinguinOrderSearchResponse>(
      "/v1/order",
      { params },
    );
    return response.data;
  }

  async getOrderKeys(orderId: string, params?: KinguinDownloadKeysParams) {
    const response = await this.axiosInstance.get<KinguinKey[]>(
      `/v2/order/${orderId}/keys`,
      { params },
    );
    return response.data;
  }

  async returnOrderKeys(orderId: string) {
    const response = await this.axiosInstance.post<KinguinReturnKeyResult[]>(
      `/v2/order/${orderId}/keys/return`,
    );
    return response.data;
  }

  async getBalance() {
    const response =
      await this.axiosInstance.get<KinguinBalance>("/v1/balance");
    return response.data;
  }

  async getRegions() {
    const response =
      await this.axiosInstance.get<KinguinRegion[]>("/v1/regions");
    return response.data;
  }

  async getPlatforms() {
    const response = await this.axiosInstance.get<string[]>("/v1/platforms");
    return response.data;
  }

  async getGenres() {
    const response = await this.axiosInstance.get<string[]>("/v1/genres");
    return response.data;
  }
}

export { Kinguin };
