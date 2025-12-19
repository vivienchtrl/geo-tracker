import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

export function RecentActivity() {
    return (
        <div className="space-y-8">
            <div className="flex items-center">
                <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                        ChatGPT Check - My Awesome Blog
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Rank #4 for "best pizza"
                    </p>
                </div>
                <div className="ml-auto font-medium">Just now</div>
            </div>
            <div className="flex items-center">
                <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                        Perplexity Check - My Awesome Blog
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Rank #2 for "best pizza"
                    </p>
                </div>
                <div className="ml-auto font-medium">2 min ago</div>
            </div>
            <div className="flex items-center">
                <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                        Claude Check - External Site
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Rank #10 for "tech news"
                    </p>
                </div>
                <div className="ml-auto font-medium">10 min ago</div>
            </div>
        </div>
    )
}
