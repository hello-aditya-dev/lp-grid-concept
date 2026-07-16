# Concept video (placeholder)

The final 8–12 second silent concept film will be placed at:

```
public/media/lp-grid-concept.mp4
```

When the MP4 exists at that path, the in-page `<ConceptVideo />` component
(located at `src/components/lp-grid/ConceptVideo.tsx`) will automatically
render a "Watch concept film" affordance that opens a modal player.

Until the file exists, **no video link is rendered anywhere in the app**.
This keeps the deployment free of 404s and broken-player UI.

A compressed WebM companion may optionally be placed at:

```
public/media/lp-grid-concept.webm
```

for browsers that prefer it.
