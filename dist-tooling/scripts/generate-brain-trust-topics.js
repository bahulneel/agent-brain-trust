/**
 * One-off generator: writes content/topics/root/** and new expert stubs under content/experts/.
 * Run: npx tsx scripts/generate-brain-trust-topics.ts
 */
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stringify } from "yaml";
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TOPICS = join(ROOT, "content", "topics");
const EXPERTS = join(ROOT, "content", "experts");
const EXISTING = new Set([
    "william-e-byrd",
    "gerald-jay-sussman",
    "guy-l-steele-jr",
    "peter-alvaro",
    "rich-hickey",
    "m-c-escher",
    "donald-e-knuth",
    "brian-w-kernighan",
    "tracy-kidder",
    "james-gleick",
    "kathy-sierra",
    "martin-fowler",
    "richard-p-feynman",
    "douglas-adams",
]);
const NEW_EXPERTS = [
    "barbara-liskov",
    "alan-kay",
    "leslie-lamport",
    "michael-stonebraker",
    "jim-gray",
    "werner-vogels",
    "eric-brewer",
    "pat-helland",
    "james-gosling",
    "anders-hejlsberg",
    "guido-van-rossum",
    "brendan-eich",
    "rob-pike",
    "ken-thompson",
    "joe-armstrong",
    "carl-hewitt",
    "nancy-leveson",
    "butler-lampson",
    "david-parnas",
    "niklaus-wirth",
    "tony-hoare",
    "simon-peyton-jones",
    "phil-wadler",
    "martin-odersky",
    "kent-beck",
    "robert-c-martin",
    "steve-mcconnell",
    "ward-cunningham",
    "grady-booch",
    "ivar-jacobson",
    "don-norman",
    "jakob-nielsen",
    "alan-cooper",
    "edward-tufte",
    "erik-spiekermann",
    "julie-zhuo",
    "marty-cagan",
    "teresa-torres",
    "melissa-perri",
    "kim-scott",
    "patrick-lencioni",
    "clayton-christensen",
    "michael-porter",
    "henry-mintzberg",
    "peter-drucker",
    "frederick-brooks",
    "steven-pinker",
    "anne-lamott",
    "edsger-w-dijkstra",
    "jaron-lanier",
    "david-heinemeier-hansson",
];
function branch(id, label, children) {
    return { id, label, children };
}
function leaf(l) {
    const o = {
        id: l.id,
        label: l.label,
        expert_ids: l.experts,
    };
    if (l.keywords?.length)
        o.keywords = l.keywords;
    return o;
}
async function writeBranch(rel, data) {
    const dir = join(TOPICS, "root", ...rel);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "topic.yml"), stringify(data, { lineWidth: 0 }) + "\n", "utf8");
}
async function writeLeaf(rel, l) {
    const dir = join(TOPICS, "root", ...rel);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, `${l.id}.yml`), stringify(leaf(l), { lineWidth: 0 }) + "\n", "utf8");
}
function expertStub(id) {
    const title = id
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    return `### ${title}

**Bio**: Draft persona for **${title}** — replace with accurate biography and primary domain.
**Attitude**: Replace with characteristic stance toward problems in their field.
**Tone**: Replace with typical voice and rhetorical habits.

- **Core Drives**: (what they optimise for)
- **Core move**: (how they typically advance understanding)
- **Prefers**: …
- **Rejects**: …
- **Watch for**: …
- **Signature question**: …
`;
}
async function main() {
    for (const id of NEW_EXPERTS) {
        if (EXISTING.has(id))
            throw new Error(`duplicate expert id: ${id}`);
    }
    const entries = await readdir(TOPICS).catch(() => []);
    for (const name of entries) {
        if (name === "root")
            continue;
        if (name.endsWith(".yaml") || name.endsWith(".yml")) {
            await rm(join(TOPICS, name), { force: true });
        }
    }
    await rm(join(TOPICS, "root"), { recursive: true, force: true });
    await mkdir(join(TOPICS, "root"), { recursive: true });
    await writeBranch([], branch("knowledge-work", "Knowledge work", [
        "computing",
        "design",
        "writing",
        "editing",
        "explanation",
        "education",
        "product",
        "organisation",
    ]));
    await writeBranch(["computing"], branch("computing", "Computing", [
        "software-systems",
        "programming-languages",
        "frontend-engineering",
    ]));
    await writeBranch(["computing", "software-systems"], branch("software-systems", "Software systems", [
        "software-architecture",
        "distributed-systems",
        "data-intensive-systems",
        "software-evolution",
    ]));
    const sw = [
        {
            id: "software-architecture",
            label: "Software architecture",
            experts: ["rich-hickey", "frederick-brooks", "david-parnas"],
            keywords: ["architecture", "structure", "modularity", "boundaries"],
        },
        {
            id: "distributed-systems",
            label: "Distributed systems",
            experts: ["peter-alvaro", "leslie-lamport", "werner-vogels", "eric-brewer", "pat-helland"],
            keywords: ["distributed", "consistency", "availability", "partitioning", "causality"],
        },
        {
            id: "data-intensive-systems",
            label: "Data-intensive systems",
            experts: ["michael-stonebraker", "jim-gray"],
            keywords: ["database", "storage", "indexing", "transactions"],
        },
        {
            id: "software-evolution",
            label: "Software evolution",
            experts: ["martin-fowler", "kent-beck"],
            keywords: ["refactoring", "legacy", "maintenance", "design"],
        },
    ];
    for (const l of sw)
        await writeLeaf(["computing", "software-systems"], l);
    await writeBranch(["computing", "programming-languages"], branch("programming-languages", "Programming languages", [
        "type-systems-and-formal-methods",
        "language-design",
        "logic-relational-programming",
        "compilers-runtimes",
    ]));
    const pl = [
        {
            id: "type-systems-and-formal-methods",
            label: "Type systems, formal methods",
            experts: ["tony-hoare", "barbara-liskov", "edsger-w-dijkstra", "phil-wadler"],
            keywords: ["types", "semantics", "verification", "proof"],
        },
        {
            id: "language-design",
            label: "Language design",
            experts: ["guy-l-steele-jr", "alan-kay", "niklaus-wirth", "martin-odersky"],
            keywords: ["language", "syntax", "abstraction", "semantics"],
        },
        {
            id: "logic-relational-programming",
            label: "Logic, relational programming",
            experts: ["william-e-byrd", "gerald-jay-sussman", "carl-hewitt"],
            keywords: ["logic", "relations", "constraints", "miniKanren"],
        },
        {
            id: "compilers-runtimes",
            label: "Compilers, runtimes",
            experts: ["anders-hejlsberg", "james-gosling", "guido-van-rossum", "simon-peyton-jones"],
            keywords: ["compiler", "runtime", "JIT", "VM"],
        },
    ];
    for (const l of pl)
        await writeLeaf(["computing", "programming-languages"], l);
    await writeBranch(["computing", "frontend-engineering"], branch("frontend-engineering", "Frontend engineering", [
        "frontend-architecture-patterns",
        "rendering-performance",
        "accessibility-implementation",
    ]));
    const fe = [
        {
            id: "frontend-architecture-patterns",
            label: "Frontend architecture, design systems",
            experts: ["brendan-eich", "rob-pike", "ken-thompson"],
            keywords: ["React", "components", "state", "bundler"],
        },
        {
            id: "rendering-performance",
            label: "Rendering, performance",
            experts: ["joe-armstrong", "brendan-eich"],
            keywords: ["latency", "render", "performance", "UI"],
        },
        {
            id: "accessibility-implementation",
            label: "Accessibility implementation",
            experts: ["nancy-leveson", "butler-lampson"],
            keywords: ["a11y", "WCAG", "keyboard", "ARIA"],
        },
    ];
    for (const l of fe)
        await writeLeaf(["computing", "frontend-engineering"], l);
    await writeBranch(["design"], branch("design", "Design", ["human-computer-interaction", "visual-communication"]));
    await writeBranch(["design", "human-computer-interaction"], branch("human-computer-interaction", "Human–computer interaction", [
        "interaction-design",
        "usability",
        "user-research",
        "information-architecture",
    ]));
    const hci = [
        { id: "interaction-design", label: "Interaction design", experts: ["alan-cooper", "julie-zhuo"], keywords: ["UX", "flows", "affordances"] },
        { id: "usability", label: "Usability", experts: ["don-norman", "jakob-nielsen"], keywords: ["usability", "heuristics", "testing"] },
        { id: "user-research", label: "User research", experts: ["teresa-torres", "marty-cagan"], keywords: ["research", "interviews", "synthesis"] },
        { id: "information-architecture", label: "Information architecture", experts: ["edward-tufte", "kathy-sierra"], keywords: ["IA", "navigation", "labelling"] },
    ];
    for (const l of hci)
        await writeLeaf(["design", "human-computer-interaction"], l);
    await writeBranch(["design", "visual-communication"], branch("visual-communication", "Visual communication", [
        "information-design",
        "graphic-design",
        "typography",
        "visual-metaphor-and-systems",
    ]));
    const vis = [
        { id: "information-design", label: "Information design", experts: ["edward-tufte", "erik-spiekermann"], keywords: ["charts", "diagrams", "data-ink"] },
        { id: "graphic-design", label: "Graphic design", experts: ["m-c-escher", "erik-spiekermann"], keywords: ["layout", "composition", "grid"] },
        { id: "typography", label: "Typography", experts: ["erik-spiekermann"], keywords: ["type", "fonts", "readability"] },
        {
            id: "visual-metaphor-and-systems",
            label: "Visual metaphor, systems",
            experts: ["m-c-escher", "jaron-lanier"],
            keywords: ["metaphor", "pattern", "symmetry"],
        },
    ];
    for (const l of vis)
        await writeLeaf(["design", "visual-communication"], l);
    await writeBranch(["writing"], branch("writing", "Writing", [
        "technical-writing",
        "journalism-narrative-nonfiction",
        "rhetoric-style-prose",
    ]));
    await writeBranch(["writing", "technical-writing"], branch("technical-writing", "Technical writing", [
        "documentation",
        "api-reference-writing",
        "developer-education-writing",
    ]));
    const tw = [
        { id: "documentation", label: "Documentation", experts: ["donald-e-knuth", "brian-w-kernighan"], keywords: ["docs", "manual", "tutorial"] },
        { id: "api-reference-writing", label: "API reference writing", experts: ["steve-mcconnell", "robert-c-martin", "martin-fowler"], keywords: ["API", "reference", "SDK"] },
        { id: "developer-education-writing", label: "Developer education writing", experts: ["david-heinemeier-hansson", "steve-mcconnell"], keywords: ["teach", "onboarding", "examples"] },
    ];
    for (const l of tw)
        await writeLeaf(["writing", "technical-writing"], l);
    await writeBranch(["writing", "journalism-narrative-nonfiction"], branch("journalism-narrative-nonfiction", "Journalism, narrative nonfiction", [
        "reporting",
        "narrative-forms",
        "explanatory-features",
    ]));
    const jn = [
        { id: "reporting", label: "Reporting", experts: ["tracy-kidder", "james-gleick"], keywords: ["reportage", "sources", "facts"] },
        { id: "narrative-forms", label: "Narrative forms", experts: ["tracy-kidder", "anne-lamott"], keywords: ["scene", "structure", "story"] },
        { id: "explanatory-features", label: "Explanatory features", experts: ["james-gleick", "steven-pinker"], keywords: ["explain", "longform", "essay"] },
    ];
    for (const l of jn)
        await writeLeaf(["writing", "journalism-narrative-nonfiction"], l);
    await writeBranch(["writing", "rhetoric-style-prose"], branch("rhetoric-style-prose", "Rhetoric, style, prose", [
        "prose-craft",
        "humour-irony",
    ]));
    const rs = [
        { id: "prose-craft", label: "Prose craft", experts: ["steven-pinker", "anne-lamott"], keywords: ["clarity", "style", "sentences"] },
        { id: "humour-irony", label: "Humour, irony", experts: ["douglas-adams"], keywords: ["wit", "comedy", "tone"] },
    ];
    for (const l of rs)
        await writeLeaf(["writing", "rhetoric-style-prose"], l);
    await writeBranch(["editing"], branch("editing", "Editing", ["technical-editing", "micro-editing"]));
    await writeBranch(["editing", "technical-editing"], branch("technical-editing", "Technical editing", [
        "structure-editing",
        "clarity-editing",
        "terminology-consistency",
        "audience-fit",
    ]));
    const te = [
        { id: "structure-editing", label: "Structure editing", experts: ["martin-fowler", "grady-booch"], keywords: ["outline", "flow", "architecture-of-prose"] },
        { id: "clarity-editing", label: "Clarity editing", experts: ["kathy-sierra", "steven-pinker"], keywords: ["plain", "simple", "precision"] },
        { id: "terminology-consistency", label: "Terminology consistency", experts: ["ivar-jacobson", "grady-booch"], keywords: ["glossary", "terms", "consistency"] },
        { id: "audience-fit", label: "Audience fit", experts: ["kathy-sierra", "don-norman"], keywords: ["reader", "persona", "level"] },
    ];
    for (const l of te)
        await writeLeaf(["editing", "technical-editing"], l);
    await writeLeaf(["editing"], {
        id: "micro-editing",
        label: "Line and copy editing",
        experts: ["anne-lamott", "steve-mcconnell"],
        keywords: ["copyedit", "line-edit", "proof"],
    });
    await writeBranch(["explanation"], branch("explanation", "Explanation", ["science-explanation", "demonstration-showing"]));
    await writeBranch(["explanation", "science-explanation"], branch("science-explanation", "Science explanation", [
        "physical-intuition",
        "models-analogies",
        "conceptual-simplification",
        "public-science-writing",
    ]));
    const se = [
        { id: "physical-intuition", label: "Physical intuition", experts: ["richard-p-feynman"], keywords: ["intuition", "physics", "teaching"] },
        { id: "models-analogies", label: "Models, analogies", experts: ["richard-p-feynman", "james-gleick"], keywords: ["model", "analogy", "mental-model"] },
        { id: "conceptual-simplification", label: "Conceptual simplification", experts: ["steven-pinker", "richard-p-feynman"], keywords: ["simplify", "explain", "concepts"] },
        { id: "public-science-writing", label: "Public science writing", experts: ["james-gleick", "steven-pinker"], keywords: ["popularisation", "science-writing"] },
    ];
    for (const l of se)
        await writeLeaf(["explanation", "science-explanation"], l);
    await writeBranch(["explanation", "demonstration-showing"], branch("demonstration-showing", "Demonstration, showing", [
        "guided-demonstration",
        "experimental-demonstration",
    ]));
    const ds = [
        { id: "guided-demonstration", label: "Guided demonstration", experts: ["donald-e-knuth", "brian-w-kernighan"], keywords: ["walkthrough", "example", "show"] },
        { id: "experimental-demonstration", label: "Experimental demonstration", experts: ["richard-p-feynman"], keywords: ["experiment", "demo", "lab"] },
    ];
    for (const l of ds)
        await writeLeaf(["explanation", "demonstration-showing"], l);
    await writeBranch(["education"], branch("education", "Education", ["pedagogy"]));
    await writeBranch(["education", "pedagogy"], branch("pedagogy", "Pedagogy", [
        "learning-design",
        "scaffolding",
        "misconceptions",
        "transfer-of-knowledge",
    ]));
    const ped = [
        { id: "learning-design", label: "Learning design", experts: ["kathy-sierra", "teresa-torres"], keywords: ["curriculum", "objectives", "assessment"] },
        { id: "scaffolding", label: "Scaffolding", experts: ["kathy-sierra", "clayton-christensen"], keywords: ["scaffold", "progression", "support"] },
        { id: "misconceptions", label: "Misconceptions", experts: ["richard-p-feynman", "don-norman"], keywords: ["misconception", "repair", "diagnosis"] },
        { id: "transfer-of-knowledge", label: "Transfer of knowledge", experts: ["david-parnas", "barbara-liskov"], keywords: ["transfer", "generalisation", "application"] },
    ];
    for (const l of ped)
        await writeLeaf(["education", "pedagogy"], l);
    await writeBranch(["product"], branch("product", "Product", ["product-strategy", "product-discovery"]));
    await writeBranch(["product", "product-strategy"], branch("product-strategy", "Product strategy", [
        "problem-framing",
        "opportunity-selection",
        "prioritisation",
        "positioning",
        "roadmaps",
    ]));
    const ps = [
        { id: "problem-framing", label: "Problem framing", experts: ["marty-cagan", "teresa-torres"], keywords: ["problem", "JTBD", "outcome"] },
        { id: "opportunity-selection", label: "Opportunity selection", experts: ["clayton-christensen", "michael-porter"], keywords: ["opportunity", "strategy", "choice"] },
        { id: "prioritisation", label: "Prioritisation", experts: ["melissa-perri", "martin-fowler"], keywords: ["RICE", "backlog", "priority"] },
        { id: "positioning", label: "Positioning", experts: ["michael-porter", "david-heinemeier-hansson"], keywords: ["positioning", "market", "differentiation"] },
        { id: "roadmaps", label: "Roadmaps", experts: ["melissa-perri", "patrick-lencioni"], keywords: ["roadmap", "planning", "timeline"] },
    ];
    for (const l of ps)
        await writeLeaf(["product", "product-strategy"], l);
    await writeBranch(["product", "product-discovery"], branch("product-discovery", "Product discovery", [
        "discovery-research",
        "experiments",
        "evidence-for-decisions",
    ]));
    const pd = [
        { id: "discovery-research", label: "Discovery research", experts: ["teresa-torres", "marty-cagan"], keywords: ["discovery", "interview", "insight"] },
        { id: "experiments", label: "Experiments", experts: ["eric-brewer", "kent-beck"], keywords: ["experiment", "A/B", "hypothesis"] },
        { id: "evidence-for-decisions", label: "Evidence for decisions", experts: ["kim-scott", "peter-drucker"], keywords: ["evidence", "metrics", "decision"] },
    ];
    for (const l of pd)
        await writeLeaf(["product", "product-discovery"], l);
    await writeBranch(["organisation"], branch("organisation", "Organisation", ["organisation-design", "management-collaboration"]));
    await writeBranch(["organisation", "organisation-design"], branch("organisation-design", "Organisation design", [
        "team-structure",
        "decision-rights",
        "coordination-mechanisms",
        "incentives-accountability",
    ]));
    const od = [
        { id: "team-structure", label: "Team structure", experts: ["melissa-perri", "patrick-lencioni"], keywords: ["teams", "squads", "structure"] },
        { id: "decision-rights", label: "Decision rights", experts: ["henry-mintzberg", "peter-drucker"], keywords: ["RACI", "authority", "ownership"] },
        { id: "coordination-mechanisms", label: "Coordination mechanisms", experts: ["frederick-brooks", "werner-vogels"], keywords: ["coordination", "communication", "process"] },
        { id: "incentives-accountability", label: "Incentives, accountability", experts: ["kim-scott", "clayton-christensen"], keywords: ["OKR", "accountability", "culture"] },
    ];
    for (const l of od)
        await writeLeaf(["organisation", "organisation-design"], l);
    await writeBranch(["organisation", "management-collaboration"], branch("management-collaboration", "Management, collaboration", [
        "planning-cadences",
        "feedback-cycles",
        "conflict-resolution",
        "leadership-communication",
    ]));
    const mc = [
        { id: "planning-cadences", label: "Planning cadences", experts: ["peter-drucker", "henry-mintzberg"], keywords: ["planning", "cadence", "review"] },
        { id: "feedback-cycles", label: "Feedback cycles", experts: ["kim-scott", "kent-beck"], keywords: ["feedback", "1:1", "retrospective"] },
        { id: "conflict-resolution", label: "Conflict resolution", experts: ["patrick-lencioni", "kim-scott"], keywords: ["conflict", "mediation", "alignment"] },
        { id: "leadership-communication", label: "Leadership communication", experts: ["ward-cunningham", "david-heinemeier-hansson"], keywords: ["leadership", "communication", "vision"] },
    ];
    for (const l of mc)
        await writeLeaf(["organisation", "management-collaboration"], l);
    const micro = {
        id: "micro-editing",
        label: "Line and copy editing",
        experts: ["anne-lamott", "steve-mcconnell"],
        keywords: ["copyedit", "line-edit", "proof"],
    };
    const allLeaves = [
        ...sw,
        ...pl,
        ...fe,
        ...hci,
        ...vis,
        ...tw,
        ...jn,
        ...rs,
        ...te,
        micro,
        ...se,
        ...ds,
        ...ped,
        ...ps,
        ...pd,
        ...od,
        ...mc,
    ];
    const referenced = new Set();
    for (const L of allLeaves) {
        for (const e of L.experts)
            referenced.add(e);
    }
    const required = new Set([...EXISTING, ...NEW_EXPERTS]);
    for (const id of required) {
        if (!referenced.has(id)) {
            throw new Error(`expert ${id} not placed on any leaf`);
        }
    }
    for (const id of referenced) {
        if (!required.has(id)) {
            throw new Error(`unknown expert referenced: ${id}`);
        }
    }
    for (const id of NEW_EXPERTS) {
        const p = join(EXPERTS, `${id}.md`);
        await writeFile(p, expertStub(id), "utf8");
    }
    console.log("Wrote topic tree under content/topics/root/ and", NEW_EXPERTS.length, "expert stubs.");
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=generate-brain-trust-topics.js.map