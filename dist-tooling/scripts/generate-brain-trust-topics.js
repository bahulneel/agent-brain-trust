/**
 * One-off generator: writes content/topics/knowledge-work/** and new expert stubs under content/experts/.
 * Run: npx tsx scripts/generate-brain-trust-topics.ts
 */
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stringify } from "yaml";
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TOPICS = join(ROOT, "content", "topics");
const ROOTED_TOPIC_CLADE = "knowledge-work";
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
    "lilian-weng",
    "andrew-ng",
    "denny-zhou",
    "jason-wei",
    "ethan-mollick",
    "andrej-karpathy",
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
/** Branch `topic.yml` body: ids and children come from directory layout. */
function branchMeta(label) {
    return { label };
}
function leaf(l) {
    const o = {
        label: l.label,
        expert_ids: l.experts,
    };
    if (l.keywords?.length)
        o.keywords = l.keywords;
    return o;
}
async function writeBranch(rel, data) {
    const dir = join(TOPICS, ROOTED_TOPIC_CLADE, ...rel);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "topic.yml"), stringify(data, { lineWidth: 0 }) + "\n", "utf8");
}
async function writeLeaf(rel, l) {
    const dir = join(TOPICS, ROOTED_TOPIC_CLADE, ...rel);
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
        if (name === ROOTED_TOPIC_CLADE)
            continue;
        if (name.endsWith(".yaml") || name.endsWith(".yml")) {
            await rm(join(TOPICS, name), { force: true });
        }
    }
    await rm(join(TOPICS, ROOTED_TOPIC_CLADE), { recursive: true, force: true });
    await mkdir(join(TOPICS, ROOTED_TOPIC_CLADE), { recursive: true });
    await writeBranch([], branchMeta("Knowledge work"));
    await writeBranch(["computing"], branchMeta("Computing"));
    await writeBranch(["computing", "software-systems"], branchMeta("Software systems"));
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
    await writeBranch(["computing", "programming-languages"], branchMeta("Programming languages"));
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
    await writeBranch(["computing", "frontend-engineering"], branchMeta("Frontend engineering"));
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
    await writeBranch(["computing", "agent-interfaces-prompting"], branchMeta("Agent interfaces and prompting"));
    const aip = [
        {
            id: "agent-skill-package-design",
            label: "Agent skill package design",
            experts: ["lilian-weng", "ward-cunningham", "martin-fowler"],
            keywords: [
                "agent skills",
                "SKILL.md",
                "composable instructions",
                "tool contracts",
                "discovery",
                "progressive disclosure",
                "MCP",
                "plugin manifests",
            ],
        },
        {
            id: "instruction-design-scaffolding",
            label: "Instruction design and scaffolding",
            experts: ["andrew-ng", "kathy-sierra", "steve-mcconnell"],
            keywords: ["prompt engineering", "system message", "few-shot", "objectives", "constraints", "examples", "cognitive load", "clarity"],
        },
        {
            id: "reasoning-decomposition-prompts",
            label: "Reasoning decomposition in prompts",
            experts: ["denny-zhou", "jason-wei", "richard-p-feynman"],
            keywords: ["chain of thought", "step by step", "decomposition", "scratchpad", "verification", "self-consistency", "show your work"],
        },
        {
            id: "human-machine-collaboration-trust",
            label: "Human–machine collaboration and trust",
            experts: ["ethan-mollick", "don-norman", "patrick-lencioni"],
            keywords: [
                "trust",
                "calibration",
                "oversight",
                "feedback loops",
                "human in the loop",
                "team norms",
                "psychological safety",
                "appropriate reliance",
            ],
        },
        {
            id: "llm-systems-architecture",
            label: "LLM systems architecture",
            experts: ["andrej-karpathy", "peter-alvaro", "werner-vogels"],
            keywords: ["software 2.0", "context window", "latency", "reliability", "distributed systems", "failure modes", "operational constraints"],
        },
    ];
    for (const l of aip)
        await writeLeaf(["computing", "agent-interfaces-prompting"], l);
    await writeBranch(["design"], branchMeta("Design"));
    await writeBranch(["design", "human-computer-interaction"], branchMeta("Human–computer interaction"));
    const hci = [
        { id: "interaction-design", label: "Interaction design", experts: ["alan-cooper", "julie-zhuo"], keywords: ["UX", "flows", "affordances"] },
        { id: "usability", label: "Usability", experts: ["don-norman", "jakob-nielsen"], keywords: ["usability", "heuristics", "testing"] },
        { id: "user-research", label: "User research", experts: ["teresa-torres", "marty-cagan"], keywords: ["research", "interviews", "synthesis"] },
        { id: "information-architecture", label: "Information architecture", experts: ["edward-tufte", "kathy-sierra"], keywords: ["IA", "navigation", "labelling"] },
    ];
    for (const l of hci)
        await writeLeaf(["design", "human-computer-interaction"], l);
    await writeBranch(["design", "visual-communication"], branchMeta("Visual communication"));
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
    await writeBranch(["writing"], branchMeta("Writing"));
    await writeBranch(["writing", "technical-writing"], branchMeta("Technical writing"));
    const tw = [
        { id: "documentation", label: "Documentation", experts: ["donald-e-knuth", "brian-w-kernighan"], keywords: ["docs", "manual", "tutorial"] },
        { id: "api-reference-writing", label: "API reference writing", experts: ["steve-mcconnell", "robert-c-martin", "martin-fowler"], keywords: ["API", "reference", "SDK"] },
        { id: "developer-education-writing", label: "Developer education writing", experts: ["david-heinemeier-hansson", "steve-mcconnell"], keywords: ["teach", "onboarding", "examples"] },
    ];
    for (const l of tw)
        await writeLeaf(["writing", "technical-writing"], l);
    await writeBranch(["writing", "journalism-narrative-nonfiction"], branchMeta("Journalism, narrative nonfiction"));
    const jn = [
        { id: "reporting", label: "Reporting", experts: ["tracy-kidder", "james-gleick"], keywords: ["reportage", "sources", "facts"] },
        { id: "narrative-forms", label: "Narrative forms", experts: ["tracy-kidder", "anne-lamott"], keywords: ["scene", "structure", "story"] },
        { id: "explanatory-features", label: "Explanatory features", experts: ["james-gleick", "steven-pinker"], keywords: ["explain", "longform", "essay"] },
    ];
    for (const l of jn)
        await writeLeaf(["writing", "journalism-narrative-nonfiction"], l);
    await writeBranch(["writing", "rhetoric-style-prose"], branchMeta("Rhetoric, style, prose"));
    const rs = [
        { id: "prose-craft", label: "Prose craft", experts: ["steven-pinker", "anne-lamott"], keywords: ["clarity", "style", "sentences"] },
        { id: "humour-irony", label: "Humour, irony", experts: ["douglas-adams"], keywords: ["wit", "comedy", "tone"] },
    ];
    for (const l of rs)
        await writeLeaf(["writing", "rhetoric-style-prose"], l);
    await writeBranch(["editing"], branchMeta("Editing"));
    await writeBranch(["editing", "technical-editing"], branchMeta("Technical editing"));
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
    await writeBranch(["explanation"], branchMeta("Explanation"));
    await writeBranch(["explanation", "science-explanation"], branchMeta("Science explanation"));
    const se = [
        { id: "physical-intuition", label: "Physical intuition", experts: ["richard-p-feynman"], keywords: ["intuition", "physics", "teaching"] },
        { id: "models-analogies", label: "Models, analogies", experts: ["richard-p-feynman", "james-gleick"], keywords: ["model", "analogy", "mental-model"] },
        { id: "conceptual-simplification", label: "Conceptual simplification", experts: ["steven-pinker", "richard-p-feynman"], keywords: ["simplify", "explain", "concepts"] },
        { id: "public-science-writing", label: "Public science writing", experts: ["james-gleick", "steven-pinker"], keywords: ["popularisation", "science-writing"] },
    ];
    for (const l of se)
        await writeLeaf(["explanation", "science-explanation"], l);
    await writeBranch(["explanation", "demonstration-showing"], branchMeta("Demonstration, showing"));
    const ds = [
        { id: "guided-demonstration", label: "Guided demonstration", experts: ["donald-e-knuth", "brian-w-kernighan"], keywords: ["walkthrough", "example", "show"] },
        { id: "experimental-demonstration", label: "Experimental demonstration", experts: ["richard-p-feynman"], keywords: ["experiment", "demo", "lab"] },
    ];
    for (const l of ds)
        await writeLeaf(["explanation", "demonstration-showing"], l);
    await writeBranch(["education"], branchMeta("Education"));
    await writeBranch(["education", "pedagogy"], branchMeta("Pedagogy"));
    const ped = [
        { id: "learning-design", label: "Learning design", experts: ["kathy-sierra", "teresa-torres"], keywords: ["curriculum", "objectives", "assessment"] },
        { id: "scaffolding", label: "Scaffolding", experts: ["kathy-sierra", "clayton-christensen"], keywords: ["scaffold", "progression", "support"] },
        { id: "misconceptions", label: "Misconceptions", experts: ["richard-p-feynman", "don-norman"], keywords: ["misconception", "repair", "diagnosis"] },
        { id: "transfer-of-knowledge", label: "Transfer of knowledge", experts: ["david-parnas", "barbara-liskov"], keywords: ["transfer", "generalisation", "application"] },
    ];
    for (const l of ped)
        await writeLeaf(["education", "pedagogy"], l);
    await writeBranch(["product"], branchMeta("Product"));
    await writeBranch(["product", "product-strategy"], branchMeta("Product strategy"));
    const ps = [
        { id: "problem-framing", label: "Problem framing", experts: ["marty-cagan", "teresa-torres"], keywords: ["problem", "JTBD", "outcome"] },
        { id: "opportunity-selection", label: "Opportunity selection", experts: ["clayton-christensen", "michael-porter"], keywords: ["opportunity", "strategy", "choice"] },
        { id: "prioritisation", label: "Prioritisation", experts: ["melissa-perri", "martin-fowler"], keywords: ["RICE", "backlog", "priority"] },
        { id: "positioning", label: "Positioning", experts: ["michael-porter", "david-heinemeier-hansson"], keywords: ["positioning", "market", "differentiation"] },
        { id: "roadmaps", label: "Roadmaps", experts: ["melissa-perri", "patrick-lencioni"], keywords: ["roadmap", "planning", "timeline"] },
    ];
    for (const l of ps)
        await writeLeaf(["product", "product-strategy"], l);
    await writeBranch(["product", "product-discovery"], branchMeta("Product discovery"));
    const pd = [
        { id: "discovery-research", label: "Discovery research", experts: ["teresa-torres", "marty-cagan"], keywords: ["discovery", "interview", "insight"] },
        { id: "experiments", label: "Experiments", experts: ["eric-brewer", "kent-beck"], keywords: ["experiment", "A/B", "hypothesis"] },
        { id: "evidence-for-decisions", label: "Evidence for decisions", experts: ["kim-scott", "peter-drucker"], keywords: ["evidence", "metrics", "decision"] },
    ];
    for (const l of pd)
        await writeLeaf(["product", "product-discovery"], l);
    await writeBranch(["organisation"], branchMeta("Organisation"));
    await writeBranch(["organisation", "organisation-design"], branchMeta("Organisation design"));
    const od = [
        { id: "team-structure", label: "Team structure", experts: ["melissa-perri", "patrick-lencioni"], keywords: ["teams", "squads", "structure"] },
        { id: "decision-rights", label: "Decision rights", experts: ["henry-mintzberg", "peter-drucker"], keywords: ["RACI", "authority", "ownership"] },
        { id: "coordination-mechanisms", label: "Coordination mechanisms", experts: ["frederick-brooks", "werner-vogels"], keywords: ["coordination", "communication", "process"] },
        { id: "incentives-accountability", label: "Incentives, accountability", experts: ["kim-scott", "clayton-christensen"], keywords: ["OKR", "accountability", "culture"] },
    ];
    for (const l of od)
        await writeLeaf(["organisation", "organisation-design"], l);
    await writeBranch(["organisation", "management-collaboration"], branchMeta("Management, collaboration"));
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
        ...aip,
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
    console.log("Wrote topic tree under content/topics/knowledge-work/ and", NEW_EXPERTS.length, "expert stubs.");
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=generate-brain-trust-topics.js.map