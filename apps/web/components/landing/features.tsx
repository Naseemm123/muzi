import { Card, CardContent } from "@workspace/ui/components/card";
import { Zap, Shield, Globe, MessageSquare } from "lucide-react";

const features = [
	{
		icon: Zap,
		title: "Real-time sync",
		description: "Changes appear instantly across all connected devices with zero lag.",
	},
	{
		icon: Shield,
		title: "Privacy first",
		description: "End-to-end encryption ensures your conversations stay private.",
	},
	{
		icon: Globe,
		title: "Global CDN",
		description: "Lightning-fast performance from anywhere in the world.",
	},
	{
		icon: MessageSquare,
		title: "Rich content",
		description: "Share text, files, code, and multimedia seamlessly.",
	},
];

export function Features() {
	return (
		<section id="features" className="relative z-10 py-32 px-8">
			<div className="max-w-6xl mx-auto">
				{/* Section Header */}
				<div className="text-center mb-20 animate-fade-in-up">
					<h2 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight">
						Everything you need
					</h2>
					<p className="text-lg text-white/60 max-w-xl mx-auto">
						Powerful features wrapped in a simple, elegant interface
					</p>
				</div>

				{/* Features Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{features.map((feature, index) => {
						const IconComponent = feature.icon;
						return (
							<div
								key={index}
								className="group p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-500 hover:bg-white/[0.02] animate-fade-in-up"
								style={{ animationDelay: `${index * 100}ms` }}
							>
								<div className="mb-6">
									<div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300">
										<IconComponent className="w-6 h-6 text-white" />
									</div>
								</div>

								<h3 className="text-xl font-medium text-white mb-3 group-hover:text-white transition-colors">
									{feature.title}
								</h3>
								<p className="text-white/60 leading-relaxed group-hover:text-white/70 transition-colors">
									{feature.description}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}