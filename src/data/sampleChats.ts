export interface SampleChat {
  id: string;
  title: string;
  app: 'Tinder' | 'Hinge' | 'Bumble' | 'iMessage';
  tagline: string;
  difficulty: 'Easy' | 'Tricky' | 'Cold' | 'Hot';
  snippet: string;
  avatarBg: string;
  imageUrl?: string;
}

export const SAMPLE_CHATS: SampleChat[] = [
  {
    id: 'dry-texter',
    title: 'The Dry Texter',
    app: 'Hinge',
    tagline: 'Left you with a one-word "haha true" response',
    difficulty: 'Tricky',
    avatarBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    snippet: `Them: "Yeah haha true"
Them: "So what are you up to this weekend?"
Me: "Just working on some side projects and heading to the farmers market! You?"
Them: "Nice"`
  },
  {
    id: 'hinge-prompt',
    title: 'Hinge Prompt Opening',
    app: 'Hinge',
    tagline: 'Matched on "Best travel story" prompt',
    difficulty: 'Hot',
    avatarBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    snippet: `Them: "Wait, did you actually get chased by a goose in Lisbon?"
Me: "100%. It mistook my pastel de nata for a threat. I ran 3 blocks."
Them: "Hahahah legendary. Was it worth the pastry though?"`
  },
  {
    id: 'tinder-banter',
    title: 'Playful Teasing Match',
    app: 'Tinder',
    tagline: 'Competitive coffee shop debates',
    difficulty: 'Easy',
    avatarBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    snippet: `Them: "Your bio says iced matcha > espresso. We might have a fundamental incompatibility."
Me: "Listen, don't judge until you've had an oat milk matcha with vanilla from the place on 4th street."
Them: "Bold claim. Are you willing to stake your reputation on that in person?"`
  },
  {
    id: 'cold-double-text',
    title: 'Radio Silence Resuscitation',
    app: 'iMessage',
    tagline: 'Ghosted for 3 days after setting tentative plans',
    difficulty: 'Cold',
    avatarBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    snippet: `Me: "Are you free Thursday or Friday for drinks?"
[3 DAYS LATER - NO RESPONSE]
Me: [Needs an un-awkward curveball to reignite]`
  }
];
