import { Zap, Shield, Globe, MessageSquare } from "lucide-react";
import { Reveal } from "./reveal";

const features = [
	{
		icon: Zap,
		title: "Real-time updates",
		description: "Track changes and queue updates propagate instantly across everyone in the room.",
	},
	{
		icon: Shield,
		title: "Controlled rooms",
		description: "Create your own space and manage playback as the room owner.",
	},
	{
		icon: Globe,
		title: "Simple sharing",
		description: "Invite others with a room name and start listening together quickly.",
	},
	{
		icon: MessageSquare,
		title: "Collaborative queue",
		description: "Everyone can add tracks and vote to shape what plays next.",
	},
];

export function Features() {
	return (
		<section id="features" className="relative z-10 px-4 py-20 md:px-6">
			<div className="mx-auto max-w-[1400px]">
				<Reveal className="mb-14 text-center">
					<h2 className="mb-4 text-4xl tracking-tight text-white md:text-5xl">
						Built for group listening
					</h2>
					<p className="mx-auto max-w-xl text-lg text-white/60">
						A focused workflow from link paste to synchronized playback.
					</p>
				</Reveal>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{features.map((feature, index) => {
						const IconComponent = feature.icon;
						return (
							<Reveal key={index} delayMs={index * 90}>
								<div className="group h-full rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.055]">
									<div className="mb-6">
										<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all duration-300 group-hover:scale-105 group-hover:bg-white/12">
											<IconComponent className="h-6 w-6 text-white" />
										</div>
									</div>

									<h3 className="mb-3 text-xl font-medium text-white">
										{feature.title}
									</h3>
									<p className="leading-relaxed text-white/60">
										{feature.description}
									</p>
								</div>
							</Reveal>
						);
					})}
				</div>
			</div>
		</section>
	);
}
