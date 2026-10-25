import { useAxios } from '@/utils/requests'
import { objectToCamelCase, objectToHungarian } from '@/utils/case'
import { toFailureResponse } from '@/utils/apiError'
import { APIResponse } from '.'


export type CertificateAuthority = 'digicert' | 'sectigo' | 'google' | 'lets_encrypt' | 'ssl_com'

export const CertificateAuthorityDisplay : Record<CertificateAuthority, string> = {
    digicert: 'DigiCert',
    sectigo: 'Sectigo',
    google: 'Google',
    lets_encrypt: 'Let\'s Encrypt',
    ssl_com: 'SSL.Com'
}

export type CloudflareCertInfo = {
    certificateAuthority: CertificateAuthority
}

export async function getCertInfo(zoneId: string): Promise<APIResponse<CloudflareCertInfo>> {
    const axios = useAxios()

    try {
        const response = await axios.request<any>({
            url: `/zones/${zoneId}/ssl/universal/settings`,
            method: 'get',
        })

        return (objectToCamelCase(response.data) as any)
    } catch (err) {
        return toFailureResponse<CloudflareCertInfo>(err)
    }
}

export async function patchCertAuthority(zoneId: string, authority: CertificateAuthority): Promise<APIResponse<any>> {
    const axios = useAxios()
    try {

        const response = await axios.request<any>({
            url: `/zones/${zoneId}/ssl/universal/settings`,
            method: 'patch',
            data: objectToHungarian({
                certificateAuthority: authority,
            })
        })

        return (objectToCamelCase(response.data) as any)
    } catch (err) {
        return toFailureResponse<any>(err)
    }
}
