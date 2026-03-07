import MissionPipeline from "@/components/MissionPipeline"
import TacticalLayout from "@/components/TacticalLayout"

export default function PipelinePage() {
    return (
        <TacticalLayout>
            <div className="h-full w-full bg-background-dark pt-4 relative z-10">
                <MissionPipeline />
            </div>
        </TacticalLayout>
    )
}
