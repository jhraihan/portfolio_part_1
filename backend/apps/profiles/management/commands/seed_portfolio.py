"""Load the portfolio's real content.

Every value here was supplied by the site owner. Nothing is inferred,
embellished, or invented. Sections without source material are left empty so
the frontend hides them rather than displaying filler.

Idempotent: safe to re-run. Existing records are updated in place.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.education.models import Education
from apps.profiles.models import Profile
from apps.projects.models import Project, ProjectFeature, Technology
from apps.skills.models import CourseworkSubject, Skill, SkillCategory

# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

PROFILE = {
    "full_name": "Md. Jahid Hasan Raihan",
    "display_name": "Md. Jahid Hasan Raihan",
    "title": "Software Engineer",
    "location": "Dhaka, Bangladesh",
    "email": "jahidhr05@gmail.com",
    "tagline": "I build complete, production-shaped web applications.",
    "hero_intro": (
        "Full-stack software engineer working across Django, Django REST "
        "Framework, React, and PostgreSQL. I build complete systems — the "
        "interface, the API behind it, and the database underneath."
    ),
    "availability": "Open to remote, hybrid, and onsite roles",
    "about_short": (
        "I build full-stack web applications with Django and React. What "
        "interests me is the whole system: how a request travels from the "
        "browser through the API into the database and back, how "
        "authentication holds it together, and how the schema shapes what is "
        "possible."
    ),
    "about_long": (
        "I am a software engineer based in Dhaka, Bangladesh, completing a "
        "BSc in Computer Science and Engineering at Independent University, "
        "Bangladesh.\n\n"
        "My programming started with my degree. I chose Computer Science "
        "because the field genuinely interested me, and coding turned out to "
        "be the part I could not put down. Most of what I know beyond "
        "coursework I taught myself, through online courses and by building "
        "things that broke until they did not.\n\n"
        "Python came first, then data structures and algorithms, which is "
        "still where I go to sharpen how I think about problems. Django came "
        "next and stayed — partly because Python already felt natural, and "
        "partly because it let me build entire applications rather than "
        "fragments. From there: Django REST Framework for APIs, then "
        "databases in earnest with MySQL, SQLite, and PostgreSQL, and React "
        "on the frontend.\n\n"
        "What I care about is complete, working systems. Every project I have "
        "built is a full application rather than an isolated feature: "
        "role-based access control, JWT authentication, relational schema "
        "design, and a decoupled React frontend talking to a REST API. I "
        "would rather understand why something works than just get it "
        "working."
    ),
    "github_url": "https://github.com/jhraihan",
    "linkedin_url": "https://www.linkedin.com/in/md-jahid-hasan-raihan-745023393",
    "leetcode_url": "https://leetcode.com/u/Jahid_Hasan_Raihan/",
    "meta_description": (
        "Md. Jahid Hasan Raihan — software engineer in Dhaka, Bangladesh. "
        "Full-stack applications built with Django, Django REST Framework, "
        "React, and MySQL."
    ),
}


# ---------------------------------------------------------------------------
# Technologies
# ---------------------------------------------------------------------------

TECHNOLOGIES = [
    ("Python", "language", 1),
    ("JavaScript", "language", 2),
    ("SQL", "language", 3),
    ("Java", "language", 4),
    ("HTML", "language", 5),
    ("CSS", "language", 6),
    ("React", "frontend", 10),
    ("Vite", "frontend", 11),
    ("Tailwind CSS", "frontend", 12),
    ("React Router", "frontend", 13),
    ("Context API", "frontend", 14),
    ("Bootstrap", "frontend", 15),
    ("Next.js", "frontend", 16),
    ("Django", "backend", 20),
    ("Django REST Framework", "backend", 21),
    ("Django ORM", "backend", 22),
    ("REST API", "backend", 23),
    ("JWT", "backend", 24),
    ("FastAPI", "backend", 25),
    ("Node.js", "backend", 26),
    ("Server-Sent Events", "backend", 27),
    ("MySQL", "database", 30),
    ("PostgreSQL", "database", 31),
    ("SQLite", "database", 32),
    ("Redis", "database", 33),
    ("Git", "devops", 40),
    ("GitHub", "devops", 41),
    ("Linux", "devops", 42),
    ("Nginx", "devops", 43),
    ("GitHub Actions", "devops", 44),
    ("AWS", "devops", 45),
    ("Playwright", "tool", 46),
    ("SSLCommerz", "service", 50),
    ("Google Gemini API", "service", 51),
    ("Hugging Face API", "service", 52),
]


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------
# Case study sections the owner has not yet supplied are left blank on
# purpose. The frontend omits empty sections entirely.
#
# This list is the source of truth for project records: sync_projects writes
# it to an existing database on every deploy. A project removed from here must
# also be named in REMOVED_PROJECTS, or it lingers in production.

REMOVED_PROJECTS = ["promptcanvas"]

PROJECTS = [
    {
        "title": "SellFlow BD",
        "slug": "sellflowbd",
        "subtitle": "Multi-tenant order and delivery platform for F-commerce sellers",
        "accent_label": "SaaS Platform",
        "summary": (
            "A multi-tenant SaaS platform for Bangladeshi Facebook and Instagram "
            "sellers, turning scattered DM orders into a controlled order-to-cash "
            "pipeline: order entry, phone confirmation, inventory reservation, "
            "courier booking, delivery tracking, COD reconciliation, returns and "
            "profit — all scoped per store."
        ),
        "project_type": "web_app",
        "status": "completed",
        "is_solo": True,
        "is_featured": True,
        "order": 1,
        "problem": (
            "Thousands of Bangladeshi businesses sell entirely through Facebook "
            "and Instagram. Orders arrive as Messenger chats, comments and phone "
            "calls, and almost everything ships cash on delivery through a "
            "third-party courier. There is no storefront, no checkout and no "
            "system of record, so the seller tracks orders in a notebook or a "
            "spreadsheet and finds out months later that the business is not "
            "actually profitable.\n\n"
            "Cash on delivery is the fact that makes this domain hard. The seller "
            "ships goods before being paid, and every other requirement follows "
            "from that: fake orders that waste delivery money, repeat customers "
            "who refuse parcels, stock promised twice, courier money arriving in "
            "a bulk spreadsheet, and returns that quietly erase the margin."
        ),
        "solution": (
            "A multi-tenant SaaS platform that turns that chatter into a "
            "controlled order-to-cash pipeline. A seller signs up, creates a "
            "store, invites staff, and runs the whole operation from one "
            "dashboard: order entry, phone confirmation, inventory, courier "
            "booking, delivery tracking, COD reconciliation, returns and "
            "profit.\n\n"
            "An order is created as pending and confirmed after a logged call to "
            "the customer — which is the point stock is reserved. It is then "
            "booked with a courier through its API, or by pasting a consignment "
            "ID when the courier has no API. Courier webhooks and a scheduled "
            "poll bring status updates back in. On delivery the COD amount "
            "becomes collectable, and when the courier's statement arrives it is "
            "reconciled against the shipments it covers."
        ),
        "architecture": (
            "The backend is a Django REST API organised into fourteen domain "
            "apps, each with the same shape: models for structure, a services "
            "layer for business logic, and thin views that only handle HTTP. "
            "Because the rules live in services, the same order-creation path "
            "runs for the dashboard, the public order form and the API alike.\n\n"
            "Tenant isolation is enforced in three layers: a base manager that "
            "returns nothing when no store is resolved, a mixin that resolves the "
            "tenant from the user's own memberships, and a view mixin that scopes "
            "every query and injects the store on writes. A store that is not "
            "yours returns 404 rather than 403, so the API never confirms that "
            "another tenant's record exists.\n\n"
            "The order state machine declares its legal transitions as data and "
            "attaches stock side effects to them, inside a transaction with a row "
            "lock and an append-only status history. Inventory is itself an "
            "append-only ledger, and concurrent reservations are serialised with "
            "select_for_update() so the last unit in stock cannot be sold twice. "
            "Access is capability-based: five roles map to named capabilities "
            "that the API checks on every request.\n\n"
            "The deployment targets Render's free tier, which has no background "
            "workers, so there is no Celery or Redis. A GitHub Actions schedule "
            "calls a protected endpoint every fifteen minutes to sync shipments "
            "and run the alert scans."
        ),
        "challenges": (
            "Reconciling cash on delivery. A courier pays out in bulk and sends "
            "a statement as a spreadsheet, and the seller has to work out which "
            "parcels it covers and whether the amounts are right — which is "
            "exactly where money goes missing without anyone noticing.\n\n"
            "I built it to be safe rather than clever. An uploaded statement "
            "becomes a draft, and nothing is settled until someone confirms it. "
            "Every row lands in one of four buckets: matched, amount mismatch, "
            "unmatched, or already settled. Committing settles only the matched "
            "rows; a mismatch is skipped unless the seller explicitly opts in, "
            "because a silent mismatch is money quietly lost, and when one is "
            "committed the shortfall is recorded and shown on the COD ledger. "
            "Couriers name their columns differently, so the parser accepts "
            "several spellings of each field and strips currency symbols and "
            "thousands separators."
        ),
        "lessons": "",
        "github_url": "https://github.com/jhraihan/SellFlowBD",
        "live_url": "https://sellflow-web.onrender.com",
        "video_url": "https://youtu.be/4FBawFRC9EY",
        "technologies": [
            "React",
            "Vite",
            "Django",
            "Django REST Framework",
            "PostgreSQL",
            "JWT",
            "REST API",
            "SQLite",
            "GitHub Actions",
            "Python",
            "JavaScript",
        ],
        "features": [
            ("Multi-tenant stores", "Each seller's data isolated per store, with staff invited by role."),
            ("Order book", "Search, filters and a full status timeline for every order."),
            ("Phone confirmation", "Logged call outcomes; stock is reserved only once an order is confirmed."),
            ("Duplicate detection", "Warns on a recent open order with overlapping products, with an explicit override."),
            ("Customer risk scoring", "Scored from delivery and return history, with a blacklist."),
            ("Inventory ledger", "Separate on-hand and reserved counts in an append-only stock ledger."),
            ("Courier booking", "Pathao and Steadfast through their APIs, or a manually entered consignment ID."),
            ("Delivery tracking", "Courier webhooks and scheduled polling, mapped onto the order state machine."),
            ("COD reconciliation", "Courier statements uploaded, matched against shipments, reviewed, then committed."),
            ("Returns", "Received, inspected and resolved per item — restocked or written off at cost."),
            ("Profit analytics", "Net profit after cost of goods, delivery, return loss and expenses, by product, courier, district and staff."),
            ("Role-based capabilities", "Owner, manager, order staff, delivery staff and accountant, checked on every request."),
            ("Public store and order form", "Customers browse a store page and order without an account."),
            ("Invoices and parcel labels", "A5 invoice and thermal parcel label PDFs for each order."),
            ("Plans and usage limits", "A per-period order allowance checked before an order is created."),
        ],
    },
    {
        "title": "ServoraBD",
        "slug": "servorabd",
        "subtitle": "Local service marketplace built around a computed trust score",
        "accent_label": "Marketplace",
        "summary": (
            "A marketplace connecting customers in Dhaka with electricians, "
            "plumbers and other tradespeople. The engineering centre is not the "
            "booking flow but the trust model: a six-factor score computed from "
            "recorded platform events, designed so that star ratings cannot be "
            "gamed by low-volume or unreliable providers."
        ),
        "project_type": "web_app",
        "status": "completed",
        "is_solo": True,
        "is_featured": True,
        "order": 2,
        "problem": (
            "Hiring a tradesperson online usually comes down to a star rating, "
            "and star ratings carry very little information. A provider with one "
            "5-star review outranks one with two hundred jobs averaging 4.8. "
            "Ratings cluster so tightly between 4.5 and 5.0 that they barely "
            "separate anyone, and they only measure jobs that were completed — a "
            "provider who accepts ten bookings and abandons eight can still hold "
            "a perfect score.\n\n"
            "ServoraBD connects customers in Dhaka with electricians, plumbers, "
            "AC technicians and other tradespeople. The booking flow is a "
            "well-understood problem; the point of the project is the trust "
            "model."
        ),
        "solution": (
            "Every provider carries a trust score built from six measurable "
            "factors, each derived from recorded platform events rather than "
            "self-report: verification depth (20%), job volume (15%), completion "
            "reliability (20%), cancellation discipline (15%), responsiveness "
            "(10%) and review quality (20%). Search ranks providers by that "
            "score rather than by price, and the provider list shows the score "
            "alongside the jobs done, cancellations and reply time behind it.\n\n"
            "Around it sits the rest of a marketplace: OTP sign-up and JWT "
            "authentication with separate customer and provider accounts, "
            "provider profiles with service areas, availability and identity "
            "verification, a booking request lifecycle, double-blind reviews, "
            "and cash settlement with commission and an earnings ledger."
        ),
        "architecture": (
            "Django REST Framework on PostgreSQL, with a mobile-first React "
            "client built with Vite. There is no Celery, Redis or Docker: "
            "recurring work, including the nightly trust recompute, runs as "
            "Django management commands under a scheduler. Every run is "
            "recorded, and an administrator can see a job that has stopped.\n\n"
            "The trust engine keeps snapshots of each score and an audit trail "
            "of how it changed. Measured locally with 10,018 providers, provider "
            "search returns in 100 ms at the 95th percentile and the full "
            "nightly recompute takes 175 seconds.\n\n"
            "The backend has 587 tests and the frontend 47. Playwright runs both "
            "golden paths and an accessibility scan of every page at a 360-pixel "
            "phone viewport, and axe-core reports no WCAG 2.1 AA violations."
        ),
        "challenges": (
            "Making the score hard to game. Every simple scoring rule invites an "
            "obvious exploit, so each part of the design answers a specific "
            "one.\n\n"
            "A single glowing review should not beat a long record, so "
            "completion rate and reviews use Bayesian smoothing: a provider with "
            "little history regresses toward the platform mean instead of "
            "scoring 100 on one job. A cancellation's cost depends on when it "
            "happens — cancelling an hour before a job costs four times what "
            "cancelling two days ahead does — and old cancellations fade with a "
            "180-day half-life. Job volume is logarithmic and saturates at 100 "
            "jobs, so farming trivial jobs has sharply diminishing returns. "
            "Penalties for upheld disputes apply after the weighted sum, so one "
            "serious incident cannot be diluted by strong performance "
            "elsewhere.\n\n"
            "The arithmetic is pinned down by a runnable reference "
            "implementation that asserts every worked figure in the "
            "specification, and the engine reproduces both worked examples "
            "exactly."
        ),
        "lessons": "",
        "github_url": "https://github.com/jhraihan/ServoraBD",
        "live_url": "https://servorabd-web.onrender.com",
        "video_url": "https://youtu.be/P6uvjq-dDbA",
        "technologies": [
            "React",
            "Vite",
            "Django",
            "Django REST Framework",
            "PostgreSQL",
            "JWT",
            "REST API",
            "Playwright",
            "GitHub Actions",
            "Python",
            "JavaScript",
        ],
        "features": [
            ("Six-factor trust score", "Verification, volume, completion, cancellations, responsiveness and reviews, weighted into one score."),
            ("Trust-ranked search", "Providers ranked by trust rather than price, filterable by service, area, date and tier."),
            ("Provider profiles", "Service areas, availability and identity verification."),
            ("Booking lifecycle", "Requests move through an explicit state machine."),
            ("Double-blind reviews", "Reviews that feed back into the trust score."),
            ("Cash settlement", "Commission and a per-provider earnings ledger that reconciles against bookings."),
            ("OTP and JWT authentication", "Separate customer and provider accounts."),
            ("Service catalogue", "Services grouped by trade, from electrical and plumbing to cleaning and appliance repair."),
            ("Scheduled jobs", "Every recurring run recorded, with stopped jobs visible to administrators."),
            ("Accessibility", "No WCAG 2.1 AA violations reported by axe-core on any page."),
        ],
    },
    {
        "title": "MicroMart",
        "slug": "micromart",
        "subtitle": "Multi-role e-commerce platform with integrated payments",
        "accent_label": "E-commerce",
        "summary": (
            "A fully decoupled e-commerce platform serving three distinct user "
            "types — customers, sellers, and administrators — with product "
            "discovery, cart and checkout, payment processing through "
            "SSLCommerz, order tracking, and seller and inventory management."
        ),
        "project_type": "web_app",
        "status": "completed",
        "is_solo": True,
        "is_featured": True,
        "order": 3,
        "problem": (
            "A working e-commerce system is not one application but several "
            "overlapping ones. A customer browsing and buying, a seller "
            "managing a storefront and inventory, and an administrator "
            "overseeing the marketplace each need a different view of the same "
            "data, with different permissions over it. I built MicroMart to "
            "work through that problem end to end rather than build a "
            "storefront in isolation."
        ),
        "solution": (
            "A decoupled architecture: a React single-page application on the "
            "frontend, a Django and Django REST Framework API on the backend, "
            "and MySQL underneath. Authentication uses JWT, with the token "
            "identifying which of the three user types is making a request and "
            "what that user is permitted to do. Payments run through "
            "SSLCommerz."
        ),
        "architecture": (
            "The React SPA holds no server state of its own; every read and "
            "write goes through the REST API. A request carries a JWT, which "
            "the backend verifies before resolving the user's type and "
            "permissions. Views are scoped so that a seller reaches only their "
            "own store, products, and orders, while an administrator sees "
            "across the marketplace.\n\n"
            "Checkout is the most involved path. The cart is validated against "
            "current inventory and pricing, an order is created in a pending "
            "state, and the user is handed off to SSLCommerz. The gateway's "
            "response determines whether the order is confirmed, inventory is "
            "decremented, and the order enters the tracking flow — or whether "
            "it is abandoned and the reservation released."
        ),
        "challenges": (
            "The hardest part was the complete order and payment workflow. "
            "Taking a payment is straightforward in isolation; keeping an "
            "order, its inventory, and its payment state consistent is not. A "
            "user can abandon a payment mid-flow, a gateway callback can "
            "arrive late or twice, and inventory must not be decremented for "
            "an order that was never paid for. Getting the states and their "
            "transitions right — so that no path leaves the system in a "
            "half-finished state — took the most thought of anything in the "
            "project."
        ),
        "lessons": (
            "That the interesting part of a feature is usually its failure "
            "cases. The happy path through checkout took a fraction of the "
            "time; everything after it — abandoned payments, duplicate "
            "callbacks, stock that must not be committed prematurely — was "
            "the actual work. I also learned how much a clear set of order "
            "states simplifies the code around them: once the transitions "
            "were explicit, most of the conditional logic scattered through "
            "the views disappeared."
        ),
        "github_url": "https://github.com/jhraihan/MicroMart",
        "live_url": "https://micromart-17ws.onrender.com",
        "video_url": "https://youtu.be/6ujWklMaXg0",
        "technologies": [
            "React",
            "Django",
            "Django REST Framework",
            "MySQL",
            "JWT",
            "REST API",
            "Python",
            "JavaScript",
            "SSLCommerz",
        ],
        "features": [
            ("Registration and authentication", "JWT-based authentication across three user types."),
            ("Product search", "Search across the product catalogue."),
            ("Voice search", "Spoken queries as an alternative to typing."),
            ("Shopping cart", "Cart management through to checkout."),
            ("Payment processing", "Checkout through the SSLCommerz payment gateway."),
            ("Product reviews", "Customer reviews on purchased products."),
            ("Order tracking", "Order status visible to customer and seller."),
            ("Store management", "Sellers manage their own storefront."),
            ("Product and inventory management", "Catalogue and stock levels per seller."),
            ("Sales analytics", "Sales figures for sellers and administrators."),
            ("Pricing management", "Seller-controlled product pricing."),
            ("User management", "Administrative control over platform accounts."),
            ("Complaint management", "Customer complaints routed for administrative review."),
            ("Fraud monitoring", "Administrative monitoring for suspicious activity."),
            ("Seller verification", "Verification step before a seller can trade."),
        ],
    },
    {
        "title": "EduFlow",
        "slug": "eduflow",
        "subtitle": "Role-based learning management system",
        "accent_label": "EdTech",
        "summary": (
            "A learning management system with separate Admin, Teacher, and "
            "Student roles, covering courses, lessons, assignments, "
            "enrolments, submissions, and results. Built with a Django REST "
            "Framework backend and a React frontend, with client state handled "
            "by native React hooks rather than an external state library."
        ),
        "project_type": "web_app",
        "status": "completed",
        "is_solo": True,
        "is_featured": True,
        "order": 4,
        "problem": (
            "A learning platform is defined by who is allowed to do what. A "
            "teacher creating an assignment, a student submitting to it, and "
            "an administrator overseeing both act on the same records with "
            "very different rights. EduFlow was an exercise in getting that "
            "permission model right rather than bolting roles onto an "
            "application built without them."
        ),
        "solution": (
            "Role-based access control with three distinct roles, enforced on "
            "the backend and reflected in the interface so users are never "
            "shown controls they cannot use. Authentication is JWT-based, with "
            "user lookup by phone number rather than email. The frontend is "
            "React with Vite and Tailwind CSS, kept deliberately free of heavy "
            "state dependencies."
        ),
        "architecture": (
            "The Django REST Framework backend exposes CRUD endpoints for "
            "courses, lessons, assignments, enrolments, submissions, and "
            "results. Permissions are enforced at the API layer: the role "
            "carried by the authenticated user determines both which records "
            "are returned and which operations are allowed on them.\n\n"
            "On the frontend, client state is managed with native React hooks "
            "— useState, useEffect, and React Context — with no external state "
            "management library. Server responses drive banner notifications, "
            "and destructive actions route through a shared confirmation "
            "dialog."
        ),
        "challenges": (
            "Keeping one set of permission rules authoritative. Three roles "
            "acting on the same records means every endpoint has to answer two "
            "questions rather than one: may this user perform this action, and "
            "which records may they perform it on. Answering only the first "
            "leaves a teacher able to reach another teacher's course simply by "
            "changing an id in the URL.\n\n"
            "The rule I settled on was that the interface never decides "
            "access. The API scopes every queryset by the authenticated user's "
            "role, and the frontend hides controls purely as a convenience. "
            "Hiding a button is a design choice; scoping a queryset is the "
            "actual boundary."
        ),
        "lessons": (
            "How much a project benefits from deciding the permission model "
            "before writing the first view. Roles added afterwards tend to "
            "become scattered conditionals; roles designed in stay in one "
            "place.\n\n"
            "I also deliberately built the frontend with nothing but useState, "
            "useEffect, and Context, to find out where that genuinely stops "
            "being enough. For an application of this size it never did — "
            "which was worth knowing firsthand rather than assuming."
        ),
        "github_url": "https://github.com/jhraihan/Edu-Flow",
        "live_url": "",
        "video_url": "https://youtu.be/yTR0klKN5f4",
        "technologies": [
            "React",
            "Vite",
            "Tailwind CSS",
            "Django",
            "Django REST Framework",
            "JWT",
            "REST API",
            "Python",
            "JavaScript",
            "Context API",
        ],
        "features": [
            ("Role-based access control", "Distinct permissions and interface for Admin, Teacher, and Student."),
            ("Phone-based authentication", "JWT authentication with user lookup by phone number."),
            ("Course and lesson management", "Full CRUD for courses and their lessons."),
            ("Assignments and submissions", "Teachers set assignments; students submit against them."),
            ("Enrolment management", "Students enrolled onto courses."),
            ("Results", "Recorded and viewable per student."),
            ("Server-driven notifications", "Interface feedback driven by API responses."),
            ("Confirmation dialogs", "Destructive actions confirmed before they run."),
        ],
    },
    {
        "title": "IntelliChat",
        "slug": "intellichat",
        "subtitle": "Streaming AI chat application with persistent conversations",
        "accent_label": "AI Application",
        "summary": (
            "A chat application built on the Google Gemini API, streaming "
            "responses token by token over Server-Sent Events. Conversations "
            "persist in PostgreSQL so a session survives a page reload, and "
            "responses render as Markdown with syntax-highlighted code blocks."
        ),
        "project_type": "ai",
        "status": "completed",
        "is_solo": True,
        "is_featured": True,
        "order": 5,
        "problem": (
            "A chat interface that waits for a complete model response before "
            "showing anything feels broken, even when it is working. The "
            "response has to arrive progressively, and it has to survive a "
            "page reload. Both requirements change how the backend is built."
        ),
        "solution": (
            "Django streams the model's response to the browser over "
            "Server-Sent Events rather than returning a single completed "
            "reply. Conversations and messages are persisted in PostgreSQL, so "
            "a user can reload and continue where they left off. Responses are "
            "rendered as Markdown with syntax highlighting and a copy-code "
            "control."
        ),
        "architecture": (
            "React sends a request to POST /api/chat/. Django calls the Gemini "
            "API and streams the result back as a sequence of Server-Sent "
            "Events: a meta event first, then repeated delta events carrying "
            "generated text as it arrives, and finally either a done or an "
            "error event to close the stream.\n\n"
            "Conversations and their messages are written to PostgreSQL, which "
            "is what allows a reloaded page to restore prior context. Users "
            "register, sign in, and sign out, and the session survives a "
            "reload."
        ),
        "challenges": (
            "Streaming forced me to give up the request/response shape I was "
            "used to. A normal Django view builds a complete response and "
            "returns it; here the connection has to stay open while text "
            "arrives in fragments, each one forwarded to the browser "
            "immediately.\n\n"
            "That created a second problem: a stream can end in more than one "
            "way. It can complete, it can fail partway through, and the client "
            "can disconnect while the model is still generating. I settled on "
            "an explicit event protocol — a meta event, repeated delta events, "
            "and a terminating done or error — so the frontend always knows "
            "which of those happened instead of inferring it from a stream "
            "that simply stopped."
        ),
        "lessons": (
            "That a persistence layer changes what an interface can promise. "
            "Once conversations and messages were stored in PostgreSQL rather "
            "than held in memory, a page reload stopped being a data-loss "
            "event, and the frontend could be much simpler as a result.\n\n"
            "More generally, this project taught me to design the protocol "
            "between client and server first. Once the event sequence was "
            "decided, both sides became straightforward to write."
        ),
        "github_url": "https://github.com/jhraihan/Intelli-Chat",
        "live_url": "",
        "video_url": "https://youtu.be/D6H_cSP2K68",
        "technologies": [
            "React",
            "Tailwind CSS",
            "Django",
            "Django REST Framework",
            "PostgreSQL",
            "Redis",
            "Server-Sent Events",
            "Google Gemini API",
            "Python",
            "JavaScript",
        ],
        "features": [
            ("Streaming responses", "Model output streamed token by token over Server-Sent Events."),
            ("Persistent conversations", "Conversations and messages stored in PostgreSQL and restored on reload."),
            ("Markdown rendering", "Headings, lists, tables, links, and fenced code blocks."),
            ("Syntax highlighting", "Highlighted code blocks with a copy-code control."),
            ("Authentication", "Register, sign in, and sign out, with sessions surviving reload."),
        ],
    },
    {
        "title": "MediDesk",
        "slug": "medidesk",
        "subtitle": "Hospital management system with four-role access control",
        "accent_label": "Healthcare",
        "summary": (
            "A hospital operations system covering patients, doctors, "
            "appointments, prescriptions, and billing, with JWT authentication "
            "and role-based access across Admin, Doctor, Patient, and "
            "Receptionist."
        ),
        "project_type": "web_app",
        "status": "completed",
        "is_solo": True,
        "is_featured": True,
        "order": 6,
        "problem": (
            "Hospital workflows are a permissions problem before they are a "
            "software problem. A receptionist books appointments but must not "
            "read clinical notes; a doctor issues prescriptions but does not "
            "manage billing; a patient sees only their own records. MediDesk "
            "models those boundaries across four roles."
        ),
        "solution": (
            "JWT authentication with access to each module restricted by role. "
            "Appointments, prescriptions, patient and doctor records, billing, "
            "and a medicine catalogue each expose only the operations a given "
            "role is permitted to perform."
        ),
        "architecture": (
            "Appointments move through an explicit lifecycle — booked, "
            "approved, completed, or cancelled — with filtering by doctor, "
            "patient, and date. Prescriptions link a consultation to multiple "
            "medicines, each with its own dosage and duration, so a "
            "prescription is a structured record rather than free text.\n\n"
            "Billing generates patient invoices with tracked totals and "
            "payment status. Doctor availability is a live toggle, which is "
            "what makes the booking flow reflect real capacity."
        ),
        "challenges": (
            "Modelling a prescription properly. Storing it as text would have "
            "been quick, but a prescription is genuinely structured data: one "
            "consultation links to several medicines, and each of those "
            "carries its own dosage and duration. Getting that relation right "
            "was what made the medicine catalogue and the prescription history "
            "useful rather than decorative.\n\n"
            "Four roles also made access control harder than the three-role "
            "projects. A receptionist books appointments but has no business "
            "reading clinical records; a doctor issues prescriptions but does "
            "not manage billing. Each module had to be reasoned about "
            "separately rather than governed by one blanket rule."
        ),
        "lessons": (
            "That the schema decides what the application can do later. "
            "Because prescriptions were modelled as real relations rather than "
            "free text, features like searching the medicine catalogue and "
            "linking dosages came almost for free — whereas a text field would "
            "have made all of it impossible without a migration and a "
            "rewrite.\n\n"
            "I also learned to treat an appointment as a lifecycle rather than "
            "a row. Booked, approved, completed, and cancelled are distinct "
            "states with rules about which transitions are legal, and naming "
            "them explicitly kept the logic contained."
        ),
        "github_url": "https://github.com/jhraihan/Medi-Desk",
        "live_url": "",
        "video_url": "https://youtu.be/PQhEbOxRwpY",
        "technologies": [
            "React",
            "Django",
            "Django REST Framework",
            "JWT",
            "REST API",
            "Python",
            "JavaScript",
        ],
        "features": [
            ("Role-based authentication", "JWT authentication with module access by role across four user types."),
            ("Appointment management", "Book, approve, complete, or cancel, with filtering by doctor, patient, and date."),
            ("Prescription system", "Digital prescriptions linking multiple medicines with dosage and duration."),
            ("Doctor and patient portals", "Full CRUD for patient records and doctor profiles."),
            ("Doctor availability", "Real-time availability toggle affecting bookings."),
            ("Billing and invoicing", "Patient bills with tracked totals and payment status."),
            ("Medicine inventory", "Searchable catalogue of hospital medicines and pharmacy registry."),
        ],
    },
]


# ---------------------------------------------------------------------------
# Skills
# ---------------------------------------------------------------------------

SKILL_CATEGORIES = [
    {
        "name": "Languages",
        "order": 1,
        "skills": [
            ("Python", "core", True),
            ("SQL", "strong", False),
            ("HTML", "strong", False),
            ("CSS", "strong", False),
            ("JavaScript", "working", False),
            ("Java", "familiar", False),
        ],
    },
    {
        "name": "Backend",
        "order": 2,
        "skills": [
            ("Django", "core", True),
            ("Django REST Framework", "core", True),
            ("Django ORM", "core", False),
            ("REST API design", "strong", False),
            ("Authentication (JWT, session, OAuth)", "strong", False),
            ("FastAPI", "familiar", False),
            ("Node.js", "familiar", False),
        ],
    },
    {
        "name": "Frontend",
        "order": 3,
        "skills": [
            ("React", "strong", True),
            ("React Router", "strong", False),
            ("Fetch API", "strong", False),
            ("Tailwind CSS", "working", False),
            ("Context API", "working", False),
            ("Vite", "working", False),
            ("Bootstrap", "working", False),
            ("Next.js", "familiar", False),
        ],
    },
    {
        "name": "Databases",
        "order": 4,
        "skills": [
            ("MySQL", "strong", True),
            ("PostgreSQL", "strong", False),
            ("SQLite", "strong", False),
            ("Database design and normalisation", "strong", False),
            ("Query optimisation", "working", False),
        ],
    },
    {
        "name": "DevOps and Deployment",
        "order": 5,
        "skills": [
            ("Git", "strong", False),
            ("GitHub", "strong", False),
            ("Environment management", "strong", False),
            ("Linux", "working", False),
            ("Vercel / Netlify", "working", False),
            ("Railway / Render / PythonAnywhere", "working", False),
            ("Nginx", "familiar", False),
            ("GitHub Actions", "familiar", False),
            ("AWS", "familiar", False),
        ],
    },
    {
        "name": "Tools",
        "order": 6,
        "skills": [
            ("VS Code", "strong", False),
            ("Postman", "strong", False),
            ("Git CLI", "strong", False),
            ("AI coding tools", "strong", False),
            ("pgAdmin / MySQL Workbench", "working", False),
            ("Figma", "familiar", False),
        ],
    },
]

COURSEWORK = [
    "Data Structures",
    "Algorithms",
    "Database Management Systems",
    "Operating Systems",
    "Computer Networks",
    "Object-Oriented Programming",
    "Software Engineering",
]


# ---------------------------------------------------------------------------
# Education
# ---------------------------------------------------------------------------

EDUCATION = [
    {
        "degree": "BSc in Computer Science and Engineering",
        "institution": "Independent University, Bangladesh",
        "field_of_study": "Computer Science and Engineering",
        "location": "Dhaka, Bangladesh",
        "start_year": 2022,
        "end_year": 2026,
        "is_current": True,
        "status_note": "Final year — expected December 2026",
        "result": "3.30",
        "show_result": False,
        "order": 1,
    }
]


def upsert_technologies(write):
    """Create or update every technology tag. Returns them keyed by name."""
    tech_map = {}
    for name, category, order in TECHNOLOGIES:
        tech, _ = Technology.objects.update_or_create(
            name=name, defaults={"category": category, "order": order}
        )
        tech_map[name] = tech
    write(f"{len(tech_map)} technologies loaded.")
    return tech_map


def upsert_projects(tech_map, write):
    """Write every project in PROJECTS, matched by slug.

    Media fields are not part of PROJECTS and are left untouched, so covers
    and galleries attached separately survive a re-run.
    """
    for data in PROJECTS:
        data = dict(data)
        tech_names = data.pop("technologies", [])
        features = data.pop("features", [])
        slug = data.pop("slug")

        project, created = Project.objects.update_or_create(
            slug=slug, defaults=data
        )
        project.technologies.set([tech_map[n] for n in tech_names if n in tech_map])

        project.features.all().delete()
        for index, (title, description) in enumerate(features):
            ProjectFeature.objects.create(
                project=project,
                title=title,
                description=description,
                order=index,
            )

        verb = "created" if created else "updated"
        write(
            f"  {project.title} {verb} — {len(features)} features, "
            f"{len(tech_names)} technologies."
        )


class Command(BaseCommand):
    help = "Load the portfolio's real content. Safe to re-run."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing projects and skills before loading.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            Project.objects.all().delete()
            SkillCategory.objects.all().delete()
            CourseworkSubject.objects.all().delete()
            Education.objects.all().delete()
            self.stdout.write(self.style.WARNING("Existing content cleared."))

        self._seed_profile()
        tech_map = self._seed_technologies()
        self._seed_projects(tech_map)
        self._seed_skills()
        self._seed_education()

        self.stdout.write(self.style.SUCCESS("\nPortfolio content loaded."))

    def _seed_profile(self):
        profile = Profile.objects.first()
        if profile:
            for key, value in PROFILE.items():
                setattr(profile, key, value)
            profile.save()
            self.stdout.write("Profile updated.")
        else:
            Profile.objects.create(**PROFILE)
            self.stdout.write("Profile created.")

    def _seed_technologies(self):
        return upsert_technologies(self.stdout.write)

    def _seed_projects(self, tech_map):
        upsert_projects(tech_map, self.stdout.write)

    def _seed_skills(self):
        for category_data in SKILL_CATEGORIES:
            category, _ = SkillCategory.objects.update_or_create(
                name=category_data["name"],
                defaults={"order": category_data["order"]},
            )
            for index, (name, level, featured) in enumerate(category_data["skills"]):
                Skill.objects.update_or_create(
                    name=name,
                    category=category,
                    defaults={
                        "level": level,
                        "is_featured": featured,
                        "order": index,
                    },
                )
        self.stdout.write(f"{len(SKILL_CATEGORIES)} skill categories loaded.")

        for index, name in enumerate(COURSEWORK):
            CourseworkSubject.objects.update_or_create(
                name=name, defaults={"order": index}
            )
        self.stdout.write(f"{len(COURSEWORK)} coursework subjects loaded.")

    def _seed_education(self):
        for data in EDUCATION:
            data = dict(data)
            Education.objects.update_or_create(
                degree=data.pop("degree"),
                institution=data["institution"],
                defaults=data,
            )
        self.stdout.write(f"{len(EDUCATION)} education record(s) loaded.")
