import { useAxios } from '@/utils/requests'
import { objectToCamelCase, objectToHungarian } from '@/utils/case'
import { describeApiResponse } from '@/utils/apiError'
import { LoadPageResponse, convertPagination } from '@/utils/pagination'
import { APIResponse, CloudflareZoneRecord, PageSettings } from '.'
import i18n from '@/locales'

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
        throw new Error(describeApiResponse(zones, i18n.global.t('errors.loadZonesFailed')))
    }

    return {
        data: zones.result,
        pageDetail: convertPagination(zones.resultInfo)
    }
}
