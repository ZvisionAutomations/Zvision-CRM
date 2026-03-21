import { getCampaigns } from "@/lib/actions/ads"
import { AdsCommandClient } from "./ads-command-client"

// ─── Server Component: fetches all campaign data ─────────────────────────────

export default async function CentralDeAnuncios() {
    const { campaigns, error } = await getCampaigns()

    const tableNotFound = error === 'TABLE_NOT_FOUND'

    return (
        <AdsCommandClient
            campaigns={campaigns}
            tableNotFound={tableNotFound}
        />
    )
}
