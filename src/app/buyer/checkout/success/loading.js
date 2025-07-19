export default function Loading() {
    return (
        <div className="container mx-auto py-8">
            <div className="max-w-4xl mx-auto">
                <div className="animate-pulse">
                    {/* Header skeleton */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
                    </div>

                    {/* Card skeletons */}
                    <div className="space-y-6">
                        <div className="h-64 bg-gray-200 rounded-lg"></div>
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                        <div className="h-48 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}