System Prompt: LegacyLink QR Generation and Dynamic Routing Engine

Context:
I am building a "Grief Tech" platform called LegacyLink. The business places durable, weather-resistant physical QR code plaques on tombstones, urns, and memorials. When a visitor scans the QR code with a smartphone, it opens a mobile-first, web-based digital biography and multimedia timeline of the deceased. Because these physical plaques are permanently engraved and exposed to outdoor elements (rain, harsh sunlight, dust), the software routing and QR architecture must be meticulously engineered for long-term stability and maximum scannability.

Core Architectural Requirements for this Module:
1. URL Compression Constraint: We must NOT embed long, complex profile URLs inside the physical QR code. Long URLs create dense, high-matrix QR patterns that are difficult for smartphone cameras to read in poor outdoor lighting, shadows, or when the plaque has light surface scratches or rain droplets.
2. Redirection/Routing Layer: We must decouple the physical hardware from our main application structure. The physical plaque will feature a short, static, immutable URL path (e.g., `https://lglk.to/p/{short_id}`). The system must resolve this short ID instantly at the edge and redirect the user or hydrate a Single Page Application (SPA) view pointing to the actual data profile. This ensures that if we rename our business domain, change our database structures, or rewrite our web app frameworks 10 years from now, the physical headstones never "brick"—we simply update our backend routing rules.
3. High Error Correction: The generated QR codes must utilize Level H (High) error correction, allowing the physical matrix code to recover and scan successfully even if up to 30% of the plaque surface is obscured, scratched, or weathered.
4. Manufacturing Hand-Off: The engine must export the final QR graphic as a clean, scalable vector asset (pure SVG string or file) with explicit white buffer padding, ensuring laser-engraving or high-fire ceramic partners can scale it onto stone without pixelation or raster fuzziness.

Your Task:
Please write the complete backend implementation in Node.js (TypeScript preferred) to handle the generation layer and the routing framework. Include the following components:

1. Dynamic Router / Redirect Middleware:
    - A mock API route or edge middleware handler (e.g., using Fastify, Express, or Next.js API/Middleware) that catches incoming scans targeting `/p/:shortId`.
    - It should perform a highly optimized database/lookup query to translate the `shortId` into the true `profileId`.
    - Implement basic analytics incrementation (incrementing a `scans_count` field or logging a timestamped scan event) before rendering/redirecting, ensuring the system can handle traffic anomalies without slowing down the initial user load time.

2. Programmatic QR Code Generator Service:
    - A utility function `generateLegacyQR(shortId: string): Promise<string>` using a robust library like `qrcode`.
    - Ensure the library is strictly configured for Error Correction Level 'H', a minimum of a 4-pixel quiet zone/margin, a clean crisp color schema (absolute black matrix on a clean white background), and outputs a raw SVG vector string.
    - Include code comments explaining the configuration choices.

3. Unique Collision-Free ShortID Generator:
    - A utility function that generates an obscure, URL-safe, short alphanumeric string (e.g., 6 to 8 characters like `a7f3x9`) to serve as the immutable `shortId`. Do not use auto-incrementing integers or standard predictable UUIDs, as we want to prevent bad actors from guessing URLs and scraping profiles sequentially.

Please provide modular, production-ready, clean code with concise inline explanations of your engineering design choices.