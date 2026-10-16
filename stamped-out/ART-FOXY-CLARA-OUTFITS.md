# Foxy and Clara alternate outfits

Built-in image generation created `assets/foxy-clara-tracksuits.webp`, containing eight full-body poses per fighter. `foxy-clara-outfit-data.mjs` contains isolated alpha bounds, masks and hulls. WebP conversion preserves transparency. Reference 1 is the original Foxy/Clara game atlas; references 2 and 3 are the user's lime and orange SBFENT outfit images.

## Art direction

Sixteen transparent full-body felt-puppet arcade poses in a four-by-four grid: Foxy in the top two rows, Clara in the bottom two. Preserve their faces, hair, jewelry, proportions and fighting poses from the original game atlas. Foxy wears the user’s lime hoodie (hood down), purple/blue panels, wide cargo trackpants and lime/purple shoes; Clara wears the purple/blue jacket with orange collar/cuffs, orange wide trousers with blue/purple panels and matching shoes. Each fighter: ready, walk, punch, high kick, block, hurt, jump, palm power.

## Final spacing refinement prompt

Edit target: this exact 16 pose sprite sheet. Preserve every character design, clothing, color, face, hair, hat, jewelry, pose and ordering exactly. ONLY fix spacing: shrink every individual full-body sprite about 25 percent within its own cell, leaving at least 40 pixels completely transparent clearance between all neighboring sprites, above, below and sideways. Four equal rows of four equal columns. No touching or overlap. Keep all 16 full-body poses wholly inside each cell with no clipping. Same transparent background. This is a production game sprite atlas: separate isolated silhouettes are mandatory.



Ready-pose display heights match the original art within three arena units. Atlas scale compensates for the wider transparent spacing.
