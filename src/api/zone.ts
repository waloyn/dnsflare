import { useAxios } from '@/utils/requests'
import { objectToCamelCase, objectToHungarian } from '@/utils/case'
import { describeApiResponse } from '@/utils/apiError'
import { LoadPageResponse, convertPagination } from '@/utils/pagination'
import { APIResponse, CloudflareZoneRecord, PageSettings } from '.'

export async function listUserZones(page?: PageSettings): Promise<APIResponse<CloudflareZoneRecord[]>> {
    const axios = useAxios()
    let url = '/zones'

    const urlQuery = {
        ...objectToHungarian(page)
    }

    url += `?${new URLSearchParams(urlQuery).toString()}`
    const response = await axios.request<any>({
        url,
        method: 'get',
    })

    return (objectToCamelCase(response.data) as any)
}


export async function listUserZonesAll(page?: PageSettings): Promise<LoadPageResponse<CloudflareZoneRecord>> {
    const zones = await listUserZones(page)

    if (!zones.result || !zones.resultInfo) {
        throw new Error(describeApiResponse(zones, '加载域名列表失败'))
    }

    return {
        data: zones.result,
        pageDetail: convertPagination(zones.resultInfo)
    }
}
