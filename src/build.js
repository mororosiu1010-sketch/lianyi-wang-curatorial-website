import { access, cp, mkdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = process.cwd();
const outDir = join(root, "dist");
const projects = JSON.parse(await readFile(join(root, "src/content/projects.json"), "utf8"));
const site = JSON.parse(await readFile(join(root, "src/content/site.json"), "utf8"));

const navItems = [
  ["Index", "索引", "index.html", ""],
  ["Projects", "项目", "projects/index.html", "projects"],
  ["About", "关于", "about/index.html", "about"],
  ["Writing", "写作", "writing/index.html", "writing"],
  ["Contact", "联系", "contact/index.html", "contact"]
];

const projectFilters = [
  ["all", "All", "全部"],
  ["AI", "AI", "人工智能"],
  ["Dystopia", "Dystopia", "反乌托邦"],
  ["Mass Media", "Mass Media", "大众媒体"],
  ["Feminism", "Feminism", "女性主义"],
  ["Institutional criticism", "Institutional criticism", "机构批判"],
  ["Social/Site", "Social/Site", "社会 / 场域"],
  ["Gamification", "Gamification", "游戏化"]
];

const validArchiveFilters = new Set(projectFilters.filter(([value]) => value !== "all").map(([value]) => value));

const fieldTranslations = {
  "artificial intelligence": "人工智能",
  "mass media": "大众媒体",
  "collective consciousness": "集体意识",
  "social imaginaries": "社会想象",
  "human-machine relations": "人机关系",
  "East/West cultural structures": "东西方文化结构",
  "internet culture": "互联网文化",
  "technological imagination": "技术想象",
  "conceptual art": "观念艺术",
  "authorship and authorization": "作者性与授权",
  "art-world language systems": "艺术世界语言系统",
  "production relations in contemporary art": "当代艺术生产关系",
  "contemporary art": "当代艺术",
  "ritual structures": "仪式结构",
  "cultural memory": "文化记忆",
  "status systems": "身份与地位系统",
  "social access and networking rituals": "社交入口与人脉仪式",
  "institutional satire": "机构讽刺",
  "art-world economies of attention": "艺术世界的注意力经济",
  "institutional behaviour": "机构行为",
  "philosophy of technology": "技术哲学",
  "AI systems": "AI 系统",
  "media culture": "媒介文化",
  "site": "场域",
  "social space": "社会空间",
  "taxonomy": "分类学",
  "urban space": "城市空间",
  "public interface": "公共界面",
  "cultural geography": "文化地理",
  "public space": "公共空间",
  "embodied spectatorship": "身体化观看",
  "identity": "身份",
  "interiority": "内在性",
  "public/private": "公共 / 私人",
  "feminism": "女性主义",
  "gamification": "游戏化",
  "rural femininity and cultural memory": "乡村女性与文化记忆",
  "desire, stigma and the loss of speech": "欲望、污名与失语",
  "folk ritual and remystification": "民间仪式与复魅",
  "sanctification and self-sacrifice": "神圣化与自我献祭",
  "ownership and personal memory": "所有物与个人记忆",
  "object biography and equality of scale": "物的生命史与尺度平等",
  "mortality and material residue": "死亡与物质遗留",
  "repetitive labour as artistic method": "作为艺术方法的重复劳动",
  "gendered looking and power": "性别化观看与权力",
  "privacy, consent and artistic ethics": "隐私、同意与艺术伦理",
  "fiction as curatorial method": "作为策展方法的虚构",
  "online judgement from fragmented information": "基于碎片信息的网络判断",
  "Chinese literati landscape traditions": "中国文人山水传统",
  "time, space and memory": "时间、空间与记忆",
  "Dunhuang cultural geography": "敦煌文化地理",
  "embodied and synaesthetic viewing": "身体化与联觉观看",
  "domestic and psychological space": "家居与心理空间",
  "memory, dreams and interiority": "记忆、梦境与内在性",
  "thresholds, enclosure and topophilia": "阈限、封闭与恋地情结",
  "object displacement and emotional projection": "物件错位与情感投射"
};

const uiTranslations = {
  "Independent curator": "独立策展人",
  "London": "伦敦",
  "Home": "首页",
  "Skip to content": "跳至正文",
  "Back to top ↑": "返回顶部 ↑",
  "ARTWORK STATUS: CONDITIONALLY ACCEPTED": "作品状态：原则上成立",
  "AUTHORSHIP: UNDER REVIEW": "作者归属：系统处理中",
  "PUBLIC ACCESS: GRANTED": "公众访问：暂未设置门槛",
  "INSTITUTIONAL CONFIDENCE: UNVERIFIED": "机构背书：暂无，不影响使用",
  "Independent curator · London": "独立策展人 · 伦敦",
  "Independent curator / London": "独立策展人 / 伦敦",
  "Curatorial practice across": "策展工作，出没于",
  "unstable media environments.": "各种不太稳定的媒介环境。",
  "Curatorial practice across unstable media environments.": "策展工作，出没于各种不太稳定的媒介环境。",
  "Explore the project archive": "进去看看系统怎么运作",
  "CURATORIAL\nPRACTICE": "策展\n实践",
  "An operating field, not a container.": "不是容器，是现场。",
  "OUTPUT MAY CONTAIN\nINSTITUTIONAL LOGIC": "本页可能含有\n机构逻辑",
  "APPROVED*": "原则通过*",
  "*BY WHOM?": "*谁批的？",
  "Position / 01": "立场 / 01",
  "Apparently, this is how art works.": "显然，事情一般就是这么办的。",
  "Exhibitions are treated as cultural operating environments—places where images, protocols, habits and technologies organise collective experience.": "展览不只负责摆放作品，也会顺手安排人该怎么看、怎么走，以及什么值得相信。",
  "ART": "艺术",
  "SYSTEM": "系统",
  "subject to authorisation": "按流程办理",
  "Selected projects / 02": "精选项目 / 02",
  "Selected records behaving normally.*": "几份运行正常的项目档案（目前）*",
  "A deliberately incomplete selection. The full register remains available under Projects.": "这是一次故意不完整的选择。全部记录请移步项目页。",
  "* “Normally” is doing a lot of work here.": "* 正常，指尚未收到投诉。",
  "View project ↗": "查看项目 ↗",
  "Research field / 03": "研究场域 / 03",
  "Research, filed under suspicion.": "研究方向，暂且这么分。",
  "Recurring concerns move between projects, sites and media. Categories are provided for administrative comfort only.": "问题会在项目、场所和媒介之间来回流动。分类主要是为了方便填表。",
  "About / 04": "关于 / 04",
  "Please proceed to the official biography.": "以下是经本人确认的官方说法。",
  "Authorised\nversion ↗": "本人确认\n版本 ↗",
  "Projects": "项目",
  "records": "条记录",
  "Curatorial work across rooms, networks, rituals and machines.": "策展工作，出没于房间、网络、仪式和机器之间。",
  "Curatorial work across": "策展工作，出没于",
  "rooms, networks, rituals": "房间、网络、仪式",
  "and machines.": "和机器之间。",
  "Published case studies lead into a wider research register. The archive stays visible without pretending unfinished records are finished exhibitions.": "已经完成的项目页，后面跟着一批仍在整理的项目记录。没做完的，就先按没做完的样子放着。",
  "Published records": "已上线",
  "Authorised for public viewing": "已上线，因此暂时算数",
  "records have passed the extremely rigorous process of being put online.": "条记录已顺利通过“上传到网上”这一关键程序。",
  "Read case study ↗": "阅读案例 ↗",
  "Research register": "其他项目",
  "Not yet legitimised": "未获认证，但确有其事",
  "Records exist. Institutional confidence does not.": "记录是真的。机构背书暂时没有。",
  "Browse by curatorial concern": "按问题分类",
  "No.": "编号",
  "Project": "项目",
  "Operative medium": "运作媒介",
  "Research field": "研究场域",
  "No records in this filter yet.": "这个筛选项下暂无记录。",
  "RECORD OPEN": "档案可看",
  "LEGITIMACY PENDING": "认证暂缺",
  "PROMPT ACCEPTED": "指令已收",
  "AUTHOR PENDING": "署名处理中",
  "ACCESS AVAILABLE": "可以进入",
  "RMB 9.9 / DRAW": "9.9 元 / 次",
  "Project index": "项目索引",
  "← Project index": "← 项目索引",
  "selected": "已上线",
  "listed": "已列入",
  "archive entry": "档案记录",
  "What the system is doing": "这套系统在干什么",
  "Interpretation not guaranteed.": "解释仅供参考。",
  "Official record / unofficial problem": "正式档案 / 非正式问题",
  "Original curatorial material is preserved in its source language. English context is editorial, not a replacement.": "策展原文按原始语言保留；英文说明负责补充语境，不负责替原文发言。",
  "Continue at your own discretion ↓": "以下内容较长，请自行决定 ↓",
  "Context": "英文说明",
  "Original text": "中文原文",
  "Chinese summary": "中文摘要",
  "Participation note": "参与说明",
  "Consent note": "授权说明",
  "Project text": "项目文本",
  "Chinese context": "中文语境",
  "Links": "相关链接",
  "Link": "链接",
  "Next project": "下一个项目",
  "About": "关于",
  "Writing": "写作",
  "Writing / Talks": "写作 / 对谈",
  "Editorial selection in progress": "编辑正在选择中",
  "Text selection: confirmed": "文章选择：已确认",
  "Words, talks, and other public evidence.": "文字、对谈，以及其他公开证据。",
  "Words, talks, and other": "文字、对谈，以及",
  "public evidence.": "其他公开证据。",
  "Writing / 01": "写作 / 01",
  "Four texts, currently under review.": "四篇文字，正在审阅。",
  "Four selected texts.": "四篇精选文章。",
  "Titles and links will be added after selection.": "标题与链接将在选定后加入。",
  "Source links will be added after confirmation.": "来源链接确认后加入。",
  "One full text is online. Three source links remain pending.": "一篇全文已上线，其余三篇链接待补。",
  "Three full texts are online. One archive remains externally linked.": "三篇全文已上线，另有一篇保留外部存档链接。",
  "All four Chinese texts are online.": "四篇中文全文均已上线。",
  "Chinese original online · English forthcoming": "中文全文已上线 · 英文版稍后",
  "Archive copy online · full text file pending": "存档链接已上线 · 正文文件待补",
  "This page preserves the Chinese original; the English version is forthcoming.": "本页保留中文原文；英文版稍后上线。",
  "Original text archive ↗": "原文存档 ↗",
  "Published version ↗": "发布版本 ↗",
  "First publication ↗": "首发版本 ↗",
  "Paragraph archive ↗": "Paragraph 存档 ↗",
  "Article record": "文章档案",
  "Author": "作者",
  "Published": "发布日期",
  "Filed under": "归档分类",
  "Language": "语言",
  "Chinese original": "中文原文",
  "Copyright": "版权",
  "Original work by Lianyi Wang. All rights reserved.": "王莲仪原创作品，保留全部权利。",
  "Talks / 02": "对谈 / 02",
  "Public conversations, selectively documented.": "公开对谈，选择性留档。",
  "Talk records will be added selectively rather than as a complete speaking history.": "对谈记录只会精选收录，不会变成一份完整发言史。",
  "Selection pending": "选择待定",
  "Under editorial review": "编辑审核中",
  "Curatorial practice as operating environment.": "策展不只是办展，也负责制造环境。",
  "Curatorial practice as": "策展不只是办展，",
  "operating environment.": "也负责制造环境。",
  "Biography / 01": "个人介绍 / 01",
  "Approach / 02": "工作方式 / 02",
  "Research / 03": "研究 / 03",
  "Fields in circulation": "经常出现的问题",
  "Not categories. Coordinates.": "不是分类。只是经常碰到。",
  "Curriculum vitae": "个人履历",
  "Selected professional reference.": "精选专业履历。",
  "Selected professional": "精选专业",
  "reference.": "履历。",
  "Exhibitions, media environments,": "展览、媒介环境、",
  "public rituals & machine culture.": "公共仪式与机器文化。",
  "Independent curator working across contemporary art, media culture and technological imagination.": "从事当代艺术、媒介文化与技术想象研究的独立策展人。",
  "Education": "教育背景",
  "Selected curatorial projects": "精选策展项目",
  "Research interests": "研究方向",
  "Field": "领域",
  "Contact": "联系",
  "Public access: granted": "无需引荐",
  "Direct access, no application required.": "可以直接联系，不用走流程。",
  "For projects, research and conversations.": "项目、研究、聊天，均可。",
  "Email": "邮箱",
  "Social": "社交媒体",
  "Location": "位置",
  "YEAR": "年份",
  "EDUCATION": "教育背景",
  "DATES": "日期",
  "LOCATION": "地点",
  "VENUE": "场地",
  "PROJECT CONTEXT": "项目语境",
  "ROLE": "角色",
  "CO-CURATORS": "联合策展人",
  "ARTISTS": "艺术家",
  "AI PROPOSAL NOTE": "AI 方案说明",
  "COLLABORATORS": "合作方",
  "NAMED ORGANISATIONS": "相关机构",
  "FORMAT": "形式",
  "OPERATIVE MEDIUM": "运作媒介",
  "PUBLIC INTERFACE": "公共界面",
  "RESEARCH AREAS": "研究领域",
  "SYSTEM BEHAVIOUR": "系统行为",
  "Curator": "策展人",
  "Co-curator": "联合策展人",
  "Lianyi Wang, curator": "王莲仪，策展人"
};

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function depthPrefix(filePath) {
  const depth = filePath.split("/").length - 1;
  return depth === 0 ? "" : "../".repeat(depth);
}

function pageUrl(filePath, target) {
  return `${depthPrefix(filePath)}${target}`;
}

function known(value) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value && value !== "TBC");
}

function textValue(value = "") {
  return String(value).trim().replace(/\s+/g, " ");
}

function indexNumber(index) {
  return String(index + 1).padStart(2, "0");
}

function projectTheme(project) {
  if (project.slug === "from-zero") return "cobalt";
  if (project.slug === "big-names") return "vermilion";
  return "graphite";
}

function projectSystemStatus(project) {
  if (project.slug === "from-zero") return ["PROMPT ACCEPTED", "AUTHOR PENDING"];
  if (project.slug === "big-names") return ["ACCESS AVAILABLE", "RMB 9.9 / DRAW"];
  return ["RECORD OPEN", "LEGITIMACY PENDING"];
}

function projectArt(project, index = 0) {
  if (project.slug === "from-zero") {
    return `<div class="project-art project-art--zero" aria-hidden="true">
      <div class="art-grid"></div>
      <span class="art-zero">0</span>
      <span class="art-command">PROMPT → PROPOSAL → WORK</span>
      <span class="art-cursor"></span>
    </div>`;
  }

  if (project.slug === "big-names") {
    const cells = Array.from({ length: 36 }, (_, cellIndex) => `<i class="${[1, 3, 8, 10, 11, 16, 19, 24, 26, 30, 31, 33].includes(cellIndex) ? "is-on" : ""}"></i>`).join("");
    return `<div class="project-art project-art--names" aria-hidden="true">
      <span class="art-price">¥9.9</span>
      <div class="art-code">${cells}</div>
      <span class="art-access">ACCESS<br>AS<br>MEDIUM</span>
    </div>`;
  }

  return `<div class="project-art project-art--archive" aria-hidden="true"><span>${indexNumber(index)}</span></div>`;
}

function isRealEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textValue(value));
}

function hasContactPage() {
  return isRealEmail(site.email);
}

function hasWritingPage() {
  return site.writingPageEnabled === true;
}

function visibleNavItems() {
  return navItems.filter(([, , , key]) => {
    if (key === "contact") return hasContactPage();
    if (key === "writing") return hasWritingPage();
    return true;
  });
}

function buildTranslations() {
  const translations = { ...uiTranslations };
  const add = (en, zh) => {
    if (en && zh && en !== zh) translations[String(en)] = String(zh);
  };

  navItems.forEach(([en, zh]) => add(en, zh));
  projectFilters.forEach(([, en, zh]) => add(en, zh));
  add(site.name, site.nameZh);
  add(site.title, site.titleZh);
  add(site.locationDisplayEn, site.locationDisplayZh);
  add(site.education, site.educationZh);
  add(site.positioning, site.positioningZh);
  add(site.researchNote, site.researchNoteZh);
  add(site.writingPlan, site.writingPlanZh);
  add(`${site.positioning} ${site.researchNote}`, `${site.positioningZh}${site.researchNoteZh}`);
  add(`${site.title} · ${site.location}`, `${site.titleZh} · 伦敦`);
  add(`${site.title} / ${site.location}`, `${site.titleZh} / 伦敦`);
  (site.fields || []).forEach((field, index) => add(field, site.fieldsZh?.[index] || fieldTranslations[field]));
  (site.bio || []).forEach((paragraph, index) => add(paragraph, site.bioZh?.[index]));
  (site.statement || []).forEach((paragraph, index) => add(paragraph, site.statementZh?.[index]));
  (site.writing || []).forEach((item, index) => {
    add(item.title, item.titleZh);
    add(`${item.title} ↗`, item.titleZh ? `${item.titleZh} ↗` : "");
    add(item.type, item.typeZh);
    add(item.summary, item.summaryZh);
    add(item.status, item.statusZh);
    add(item.sourceLabel, item.sourceLabelZh);
    add(item.archiveLabel, item.archiveLabelZh);
    add(
      [indexNumber(index), item.type, item.date || item.year].filter(Boolean).join(" / "),
      [indexNumber(index), item.typeZh || item.type, item.date || item.year].filter(Boolean).join(" / ")
    );
  });
  (site.cv.education || []).forEach((item) => {
    add(item.label, item.labelZh);
    add(item.detail, item.detailZh);
  });
  (site.cv.sections || []).forEach((section) => {
    (section.items || []).forEach((item, index) => add(item, section.itemsZh?.[index]));
  });

  Object.entries(fieldTranslations).forEach(([en, zh]) => add(en, zh));
  projects.forEach((project) => {
    if (project.chineseTitle) add(displayTitle(project), `${project.chineseTitle} / ${project.title}`);
    add(project.summaryEn || project.summary, project.summaryZh);
    add(project.format, project.formatZh);
    add(project.operativeMedium, project.operativeMediumZh);
    add(project.publicInterface, project.publicInterfaceZh);
    add(project.systemBehaviour, project.systemBehaviourZh);
    add(project.projectContext, project.projectContextZh);
    add(project.generatedProposalContext, project.generatedProposalContextZh);
    add(project.role, project.roleZh);
    add(project.imageCredit, project.imageCreditZh);
    [project.coverImage, ...(project.images || [])].filter(Boolean).forEach((image) => {
      add(image.caption || image.alt, image.captionZh || image.altZh);
    });
    (project.artists || []).forEach((item, index) => add(item, project.artistsZh?.[index]));
    const fieldsEn = Array.isArray(project.researchFields) ? project.researchFields.join(", ") : "";
    const fieldsZh = Array.isArray(project.researchFields) ? project.researchFields.map((field) => fieldTranslations[field] || field).join("、") : "";
    add(fieldsEn, fieldsZh);
  });

  add(site.fields.join(", "), site.fieldsZh.join("、"));
  add("Zhengzhou", "郑州");
  add("Beijing", "北京");
  add("Qingdao", "青岛");
  add("Shanghai", "上海");
  add("Guangzhou", "广州");
  add("Singapore", "新加坡");
  add("Dunhuang", "敦煌");
  add("Online", "线上");
  add("Guardian Art Center, Beijing", "北京嘉德艺术中心");
  add("Entrance Space", "入口空间");
  add("Exhibition", "展览");
  add("Authorised", "本人确认");
  add("version ↗", "版本 ↗");
  add("CURATORIAL", "策展");
  add("PRACTICE", "实践");
  add("OUTPUT MAY CONTAIN", "本页可能含有");
  add("INSTITUTIONAL LOGIC", "机构逻辑");
  add("APPROVED*", "原则通过*");
  add("*BY WHOM?", "*谁批的？");
  add("策展人：Lianyi Wang", "策展人：王莲仪");
  add("Image register", "图像档案");
  add("images", "张图片");
  return translations;
}

const translations = buildTranslations();

function scriptSafeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function isPlaceholderFullText(value = "") {
  const text = textValue(value).toLowerCase();
  if (!text) return true;

  return [
    "add",
    "use this record",
    "replace this holding text",
    "this page is ready",
    "this project page is structured"
  ].some((pattern) => text.startsWith(pattern));
}

function isPlaceholderSummary(value = "") {
  const text = textValue(value).toLowerCase();
  if (!text) return true;

  return (
    text.includes("archive entry in preparation") ||
    text.includes("record prepared") ||
    text.includes("prepared for future expansion") ||
    text.includes("structured archive") ||
    text.includes("archive entry") ||
    text.includes("secondary archive") ||
    /\brecord\b/.test(text)
  );
}

function hasConfirmedItems(items = []) {
  if (!Array.isArray(items)) return false;
  return items.some((item) => {
    if (typeof item === "string") return Boolean(textValue(item)) && !isPlaceholderSummary(item);
    if (!item || typeof item !== "object") return false;

    const url = item.url || item.href;
    const title = item.title || item.label || item.text;
    return (known(url) || known(title)) && !isPlaceholderSummary(title || url);
  });
}

function hasProjectBody(project) {
  return (
    (known(project.englishContext) && !isPlaceholderFullText(project.englishContext)) ||
    (known(project.fullTextEn) && !isPlaceholderFullText(project.fullTextEn)) ||
    known(project.fullTextZh) ||
    (known(project.summaryEn) && !isPlaceholderSummary(project.summaryEn)) ||
    (known(project.summaryZh) && !isPlaceholderSummary(project.summaryZh)) ||
    known(project.foundationTextZh) ||
    known(project.participationNoteEn) ||
    known(project.consentNoteEn) ||
    (known(project.fullText) && !isPlaceholderFullText(project.fullText)) ||
    (known(project.summary) && !isPlaceholderSummary(project.summary)) ||
    known(project.images) ||
    hasConfirmedItems(project.links) ||
    hasConfirmedItems(project.press)
  );
}

function isPublicProject(project) {
  return project.publicPage === true && hasProjectBody(project);
}

function projectDateKey(project) {
  const match = String(project.dates || project.year || "").match(/\d{4}(?:\.\d{2})?(?:\.\d{2})?/);
  if (!match) return 0;
  const [year = "0", month = "0", day = "0"] = match[0].split(".");
  return Number(`${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`);
}

function projectsByRecency(items) {
  return [...items].sort((a, b) => projectDateKey(b) - projectDateKey(a));
}

function archiveState(project) {
  if (!hasProjectBody(project)) return "archive entry";
  if (project.featured) return "selected";
  return "listed";
}

function displayTitle(project) {
  return project.chineseTitle ? `${project.title} / ${project.chineseTitle}` : project.title;
}

function summaryValue(project) {
  return project.summaryEn || project.summary || project.summaryZh || "";
}

function projectIntro(project) {
  const summary = summaryValue(project);
  if (!summary || isPlaceholderSummary(summary)) {
    return "Project record pending.";
  }
  return summary;
}

function projectTeaser(project) {
  const intro = projectIntro(project);
  return intro === "Project record pending." ? "" : intro;
}

function projectFilterValues(project) {
  if (!Array.isArray(project.archiveFilters)) return [];
  return project.archiveFilters.filter((filter) => validArchiveFilters.has(filter));
}

function metadataRows(project) {
  const listValue = (value) => (Array.isArray(value) ? value.join(", ") : value);
  const rows = [
    ["YEAR", project.year],
    ["DATES", project.dates],
    ["LOCATION", project.location],
    ["VENUE", project.venue],
    ["PROJECT CONTEXT", project.projectContext],
    ["ROLE", project.role],
    ["CO-CURATORS", listValue(project.coCurators)],
    ["ARTISTS", listValue(project.artists)],
    ["AI PROPOSAL NOTE", project.generatedProposalContext],
    ["COLLABORATORS", listValue(project.collaborators)],
    ["NAMED ORGANISATIONS", listValue(project.institutions)],
    ["FORMAT", project.format],
    ["OPERATIVE MEDIUM", project.operativeMedium],
    ["PUBLIC INTERFACE", project.publicInterface],
    ["RESEARCH AREAS", listValue(project.researchFields)],
    ["SYSTEM BEHAVIOUR", project.systemBehaviour]
  ];

  return rows
    .filter(([, value]) => known(value))
    .map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`)
    .join("");
}

function layout({ filePath, title, description, active = "", body, script = "" }) {
  const prefix = depthPrefix(filePath);
  const displayName = "Lianyi Wang";
  const pageTitle = active === "" ? displayName : `${title} | ${displayName}`;
  const nav = visibleNavItems()
    .map(([label, , target, key], index) => {
      const current = active === key ? ' aria-current="page"' : "";
      return `<a href="${pageUrl(filePath, target)}"${current}><span>${indexNumber(index)}</span>${label}</a>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(pageTitle)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="robots" content="noindex, nofollow">
    <meta property="og:title" content="${esc(pageTitle)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:type" content="website">
    <link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${prefix}assets/site.css">
  </head>
  <body data-page="${esc(active || "home")}">
    <div class="site-shell">
      <a class="skip-link" href="#main">Skip to content</a>
      <header class="site-header">
        <div class="header-inner">
          <a class="brand" href="${pageUrl(filePath, "index.html")}" aria-label="Lianyi Wang home">
            <span class="brand-mark">LW</span>
            <span><b>${esc(site.name)}</b><small>${esc(site.title)} · ${esc(site.location)}</small></span>
          </a>
          <div class="header-tools">
            <nav class="nav" aria-label="Primary navigation">${nav}</nav>
            <div class="language-switch" aria-label="Language">
              <button type="button" data-language="en" aria-pressed="true">EN</button>
              <span>/</span>
              <button type="button" data-language="zh" aria-pressed="false">中文</button>
            </div>
          </div>
        </div>
      </header>
      <div class="system-ticker" aria-label="Site status">
        <div>
          <span>ARTWORK STATUS: CONDITIONALLY ACCEPTED</span><i>◆</i>
          <span>AUTHORSHIP: UNDER REVIEW</span><i>◆</i>
          <span>PUBLIC ACCESS: GRANTED</span><i>◆</i>
          <span>INSTITUTIONAL CONFIDENCE: UNVERIFIED</span><i>◆</i>
          <span aria-hidden="true">ARTWORK STATUS: CONDITIONALLY ACCEPTED</span><i aria-hidden="true">◆</i>
          <span aria-hidden="true">AUTHORSHIP: UNDER REVIEW</span><i aria-hidden="true">◆</i>
        </div>
      </div>
      <main id="main" class="page">${body}</main>
      <footer class="footer">
        <div><span class="footer-mark">LW</span><p>${esc(site.name)}<br>${esc(site.title)} · ${esc(site.location)}</p></div>
        <p>Exhibitions, media environments,<br>public rituals &amp; machine culture.</p>
        <a href="#main">Back to top ↑</a>
      </footer>
    </div>
    <script>
      (() => {
        const translations = ${scriptSafeJson(translations)};
        const key = "lw-language";
        const originalText = new WeakMap();
        const originalDocumentTitle = document.title;
        const languageButtons = document.querySelectorAll("[data-language]");

        const translateTextNodes = (language) => {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
              const parent = node.parentElement;
              if (!parent || parent.closest("script, style")) return NodeFilter.FILTER_REJECT;
              return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
          });
          const nodes = [];
          while (walker.nextNode()) nodes.push(walker.currentNode);
          nodes.forEach((node) => {
            if (!originalText.has(node)) originalText.set(node, node.nodeValue);
            const source = originalText.get(node);
            if (language === "en") {
              node.nodeValue = source;
              return;
            }
            const trimmed = source.trim();
            let translated = translations[trimmed];
            if (!translated) {
              const recordsMatch = trimmed.match(/^(\\d+) records$/);
              const publishedMatch = trimmed.match(/^(\\d+) records have passed the extremely rigorous process of being put online\\.$/);
              const numberedLabelParts = trimmed.split(" / ");
              if (recordsMatch) translated = recordsMatch[1] + " 条记录";
              if (publishedMatch) translated = publishedMatch[1] + " 条记录已顺利通过“上传到网上”这一关键程序。";
              if (/^\\d{2}$/.test(numberedLabelParts[0]) && translations[numberedLabelParts[1]]) translated = numberedLabelParts[0] + " / " + translations[numberedLabelParts[1]];
            }
            if (!translated) return;
            const leading = source.match(/^\\s*/)?.[0] || "";
            const trailing = source.match(/\\s*$/)?.[0] || "";
            node.nodeValue = language === "zh" ? translated : leading + translated + trailing;
          });
        };

        const applyProjectReadingOrder = (language) => {
          const reading = document.querySelector(".project-reading");
          if (!reading) return;
          const sections = [...reading.querySelectorAll(":scope > .project-text")];
          if (!reading.dataset.originalOrder) {
            sections.forEach((section, index) => {
              section.dataset.originalIndex = String(index);
              const number = section.querySelector(".text-label span");
              if (number) section.dataset.originalNumber = number.textContent;
            });
            reading.dataset.originalOrder = "true";
          }
          sections.sort((a, b) => {
            if (language === "zh") {
              const aZh = a.matches('[lang^="zh"]') ? 0 : 1;
              const bZh = b.matches('[lang^="zh"]') ? 0 : 1;
              if (aZh !== bZh) return aZh - bZh;
            }
            return Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex);
          });
          const followingContent = [...reading.children].find((element) => !element.classList.contains("project-text"));
          sections.forEach((section, index) => {
            reading.insertBefore(section, followingContent || null);
            const number = section.querySelector(".text-label span");
            if (number) number.textContent = language === "zh"
              ? String(index + 1).padStart(2, "0")
              : section.dataset.originalNumber;
          });
        };

        const setLanguage = (language) => {
          const lang = language === "zh" ? "zh" : "en";
          document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
          document.documentElement.dataset.language = lang;
          if (lang === "zh") {
            const titleParts = originalDocumentTitle.split(" | ");
            const localizedTitle = translations[titleParts[0]] || (titleParts[0] === "Lianyi Wang" ? "王莲仪" : titleParts[0]);
            document.title = titleParts.length > 1 ? localizedTitle + " | 王莲仪" : "王莲仪";
          } else {
            document.title = originalDocumentTitle;
          }
          translateTextNodes(lang);
          applyProjectReadingOrder(lang);
          languageButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.language === lang)));
          localStorage.setItem(key, lang);
        };

        languageButtons.forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.language)));
        setLanguage(localStorage.getItem(key) || "en");
      })();
    </script>
    ${script}
  </body>
</html>`;
}

function fieldIndex(fields) {
  return `<ol class="field-index">${fields.map((field, index) => `<li><span>${indexNumber(index)}</span>${esc(field)}</li>`).join("")}</ol>`;
}

function selectedProjectLine(project, index, filePath) {
  const note = project.systemBehaviour ? `<span class="row-note">${esc(project.systemBehaviour)}</span>` : "";
  const content = `
    <span class="index-no">${indexNumber(index)}</span>
    <span class="line-title">${esc(displayTitle(project))}</span>
    <span class="line-medium">${esc(project.operativeMedium)}</span>
    ${note}
  `;

  if (!isPublicProject(project)) {
    return `<article class="selected-line selected-line--pending" aria-disabled="true">${content}</article>`;
  }

  return `<a class="selected-line" href="${pageUrl(filePath, `projects/${project.slug}/index.html`)}">${content}</a>`;
}

function projectRow(project, index, filePath) {
  const fields = (project.researchFields || []).map((field) => `<span class="tag">${esc(field)}</span>`).join("");
  const year = known(project.year) ? `<span>${esc(project.year)}</span>` : "";
  const interfaceText = known(project.publicInterface) ? `<span>${esc(project.publicInterface)}</span>` : "";
  const teaser = projectTeaser(project);
  const filters = projectFilterValues(project);
  const meta = year ? `<div class="project-row-meta">${year}</div>` : "";
  const status = projectSystemStatus(project);
  const filterAttr = filters.join("|");
  const rowBody = `
    <div class="project-index-no">${indexNumber(index)}</div>
    <div>
      ${meta}<span class="row-state">${esc(status[1])}</span>
      <h2>${esc(displayTitle(project))}</h2>
      ${teaser ? `<p>${esc(teaser)}</p>` : ""}
      <div class="tag-list">${fields}</div>
    </div>
    <div class="project-row-aside"><span>${esc(project.operativeMedium)}</span>${interfaceText}</div>
    <div class="project-row-note">${esc(project.systemBehaviour)}</div>
  `;

  if (!isPublicProject(project)) {
    return `<article class="project-row project-row--pending" data-project-row data-filters="${esc(filterAttr)}" aria-disabled="true">${rowBody}</article>`;
  }

  return `<a class="project-row" data-project-row data-filters="${esc(filterAttr)}" href="${pageUrl(filePath, `projects/${project.slug}/index.html`)}">${rowBody}</a>`;
}

function homePage() {
  const published = projectsByRecency(projects.filter(isPublicProject));
  const selected = published.filter((project) => project.featured);

  return layout({
    filePath: "index.html",
    title: "Lianyi Wang",
    description: site.positioning,
    active: "",
    body: `<section class="hero">
      <div class="hero-copy">
        <p class="eyebrow"><span>Independent curator</span><span>London</span></p>
        <h1>Curatorial practice across <em>unstable media environments.</em></h1>
        <div class="hero-foot">
          <p>${esc(site.positioning)} ${esc(site.researchNote)}</p>
          <a class="arrow-link" href="${pageUrl("index.html", "projects/index.html")}">Explore the project archive <span>↘</span></a>
        </div>
      </div>
      <div class="hero-system" aria-label="Map of curatorial research fields">
        <div class="system-rings" aria-hidden="true"><i></i><i></i><i></i></div>
        <span class="system-core">CURATORIAL<br>PRACTICE</span>
        ${site.fields.slice(0, 6).map((field, index) => `<span class="system-node system-node--${index + 1}"><i>${indexNumber(index)}</i>${esc(field)}</span>`).join("")}
        <span class="system-caption">An operating field, not a container.</span>
        <span class="system-warning">OUTPUT MAY CONTAIN<br>INSTITUTIONAL LOGIC</span>
        <span class="system-approved">APPROVED*<small>*BY WHOM?</small></span>
      </div>
    </section>

    <section class="statement-band">
      <p class="kicker">Position / 01</p>
      <div class="statement-copy"><h2>Apparently, this is how art works.</h2><p>Exhibitions are treated as cultural operating environments—places where images, protocols, habits and technologies organise collective experience.</p></div>
      <span class="statement-side">ART<br>↔<br>SYSTEM<small>subject to authorisation</small></span>
    </section>

    <section class="featured-section">
      <div class="section-heading">
        <div><p class="kicker">Selected projects / 02</p><h2>Selected records behaving normally.*</h2></div>
        <p>A deliberately incomplete selection. The full register remains available under Projects.<span class="editorial-footnote">* “Normally” is doing a lot of work here.</span></p>
      </div>
      <div class="featured-grid">
        ${selected.map((project, index) => `<a class="project-card project-card--${projectTheme(project)}" href="${pageUrl("index.html", `projects/${project.slug}/index.html`)}">
          <div class="project-card-top"><span>${indexNumber(index)}</span><span>${esc(project.year)}</span></div>
          <div class="status-stamp"><b>${esc(projectSystemStatus(project)[0])}</b><span>${esc(projectSystemStatus(project)[1])}</span></div>
          ${projectArt(project, index)}
          <div class="project-card-copy">
            <p>${esc(project.format)}</p>
            <h3>${esc(displayTitle(project))}</h3>
            <span>View project ↗</span>
          </div>
        </a>`).join("")}
      </div>
    </section>

    <section class="research-section">
      <div class="section-heading">
        <div><p class="kicker">Research field / 03</p><h2>Research, filed under suspicion.</h2></div>
        <p>Recurring concerns move between projects, sites and media. Categories are provided for administrative comfort only.</p>
      </div>
      <ol class="research-list">${site.fields.map((field, index) => `<li><span>${indexNumber(index)}</span><strong>${esc(field)}</strong><i>↗</i></li>`).join("")}</ol>
    </section>

    <section class="about-cta">
      <p class="kicker">About / 04</p>
      <p>Please proceed to the official biography.</p>
      <a class="circle-link" href="${pageUrl("index.html", "about/index.html")}">Authorised<br>version ↗</a>
    </section>`
  });
}

function projectsPage() {
  const published = projectsByRecency(projects.filter(isPublicProject));
  const archive = projects.filter((project) => !isPublicProject(project));
  const filterButtons = projectFilters
    .map(([value, label], index) => `<button class="filter-button" type="button" data-filter="${esc(value)}" aria-pressed="${index === 0 ? "true" : "false"}">${esc(label)}</button>`)
    .join("");

  return layout({
    filePath: "projects/index.html",
    title: "Projects",
    description: "Project index for Lianyi Wang.",
    active: "projects",
    body: `<header class="index-hero">
      <p class="eyebrow"><span>Projects</span><span>${projects.length} records</span></p>
      <h1>Curatorial work across <em>rooms, networks, rituals</em> and machines.</h1>
      <div><p>Published case studies lead into a wider research register. The archive stays visible without pretending unfinished records are finished exhibitions.</p><span class="index-count">${String(projects.length).padStart(2, "0")}</span></div>
    </header>

    <section class="published-section">
      <div class="section-heading section-heading--compact"><div><p class="kicker">Published records</p><h2>Authorised for public viewing</h2></div><p>${published.length} records have passed the extremely rigorous process of being put online.</p></div>
      <div class="featured-grid featured-grid--index">
        ${published.map((project, index) => `<a class="project-card project-card--${projectTheme(project)}" href="${pageUrl("projects/index.html", `projects/${project.slug}/index.html`)}">
          <div class="project-card-top"><span>${indexNumber(index)}</span><span>${esc(project.year)}</span></div>
          <div class="status-stamp"><b>${esc(projectSystemStatus(project)[0])}</b><span>${esc(projectSystemStatus(project)[1])}</span></div>
          ${projectArt(project, index)}
          <div class="project-card-copy"><p>${esc(project.format)}</p><h3>${esc(displayTitle(project))}</h3><span>Read case study ↗</span></div>
        </a>`).join("")}
      </div>
    </section>

    <section class="archive-section">
      <div class="section-heading section-heading--compact"><div><p class="kicker">Research register</p><h2>Not yet legitimised</h2></div><p>Records exist. Institutional confidence does not.</p></div>
      <div class="filters" aria-label="Project filters">${filterButtons}</div>
      <div class="archive-head"><span>No.</span><span>Project</span><span>Operative medium</span><span>Research field</span></div>
      <div class="project-index">${archive.map((project, index) => projectRow(project, index + published.length, "projects/index.html")).join("")}</div>
    </section>
    <p class="filter-empty" data-filter-empty hidden>No records in this filter yet.</p>`,
    script: `<script src="../assets/archive.js"></script>`
  });
}

function projectPage(project) {
  const fields = (project.researchFields || []).map((field) => `<span class="tag">${esc(field)}</span>`).join("");
  const teaser = projectTeaser(project);
  const coverSection = project.coverImage
    ? `<figure class="project-cover">
        <img src="${esc(project.coverImage.src)}" alt="${esc(project.coverImage.alt)}" decoding="async">
        <figcaption>${esc(project.coverImage.caption || project.coverImage.alt)}</figcaption>
      </figure>`
    : "";
  const imageSection = project.images?.length
    ? `<section class="image-register">
        <div class="image-register-head"><p class="kicker">Image register</p><span><b>${project.images.length}</b> images</span></div>
        <div class="image-grid">${project.images.map((image) => `<figure><img src="${esc(image.src)}" alt="${esc(image.alt)}" loading="lazy" decoding="async"><figcaption>${esc(image.caption || image.alt)}</figcaption></figure>`).join("")}</div>
      </section>`
    : "";
  const imageCreditSection = project.imageCredit && (project.coverImage || project.images?.length)
    ? `<p class="project-image-credit">${esc(project.imageCredit)}</p>`
    : "";
  const linkSection = hasConfirmedItems(project.links)
    ? `<section class="link-register">
        <p class="kicker">Links</p>
        <div class="line-list">${project.links.map((link) => `<article class="line-item"><div class="tiny-meta">Link</div><div><h3><a href="${esc(link.url || link.href)}" rel="noopener">${esc(link.label || link.title || link.url || link.href)}</a></h3></div></article>`).join("")}</div>
      </section>`
    : "";

  const textBlock = (value = "") => String(value)
    .trim()
    .split(/\n{2,}/)
    .filter((paragraph) => paragraph.trim())
    .map((paragraph) => `<p>${esc(paragraph.trim()).replaceAll("\n", "<br>")}</p>`)
    .join("");
  let sectionCount = 0;
  const textSection = ({ title, text, lang = "en", primary = false }) => text
    ? `<section class="project-text${primary ? " project-text--primary" : ""}" lang="${esc(lang)}">
        <div class="text-label"><span>${String(++sectionCount).padStart(2, "0")}</span><p>${esc(title)}</p></div>
        <div class="prose">${textBlock(text)}</div>
      </section>`
    : "";

  function projectBody() {
    if (project.languageMode === "bilingual-zh-primary") {
      return [
        textSection({ title: "Context", text: project.englishContext || project.fullTextEn, lang: "en" }),
        textSection({ title: "Original text", text: project.fullTextZh, lang: project.originalTextLanguage || "zh-Hans", primary: true }),
        textSection({ title: "Chinese summary", text: project.summaryZh, lang: "zh-Hans" }),
        textSection({ title: "Participation note", text: project.participationNoteEn, lang: "en" }),
        textSection({ title: "Consent note", text: project.consentNoteEn, lang: "en" })
      ].join("");
    }

    if (project.languageMode === "bilingual-en-primary") {
      return [
        textSection({ title: "Project text", text: project.fullTextEn || project.englishContext || project.fullText, lang: "en", primary: true }),
        textSection({ title: "Chinese context", text: project.fullTextZh || project.summaryZh, lang: project.originalTextLanguage || "zh-Hans" })
      ].join("");
    }

    if (project.languageMode === "bilingual-context-only") {
      return [
        textSection({ title: "Project text", text: project.fullTextEn || project.fullText || project.summaryEn || project.summary, lang: "en", primary: true }),
        textSection({ title: "Context", text: project.englishContext || project.summaryZh, lang: project.originalTextLanguage || "zh-Hans" })
      ].join("");
    }

    const bodyText = isPlaceholderFullText(project.fullText) ? "Project record pending." : project.fullText;
    return textSection({ title: "Project text", text: bodyText, lang: "en", primary: true });
  }

  const publishedProjects = projectsByRecency(projects.filter(isPublicProject));
  const currentIndex = publishedProjects.findIndex((item) => item.slug === project.slug);
  const nextProject = publishedProjects[(currentIndex + 1) % publishedProjects.length];

  return layout({
    filePath: `projects/${project.slug}/index.html`,
    title: displayTitle(project),
    description: projectIntro(project),
    active: "projects",
    body: `<a class="breadcrumb" href="${pageUrl(`projects/${project.slug}/index.html`, "projects/index.html")}">← Project index</a>
    <header class="project-hero project-hero--${projectTheme(project)}">
      <div class="project-hero-copy">
        <p class="eyebrow"><span>${esc(archiveState(project))}</span><span>${esc(project.year)}</span></p>
        <div class="hero-status"><b>${esc(projectSystemStatus(project)[0])}</b><span>${esc(projectSystemStatus(project)[1])}</span></div>
        <h1>${esc(displayTitle(project))}</h1>
        ${teaser ? `<p>${esc(teaser)}</p>` : ""}
        <div class="tag-list">${fields}</div>
      </div>
      ${projectArt(project)}
    </header>

    ${coverSection}

    <section class="project-overview">
      <div><p class="kicker">What the system is doing</p><p class="overview-thesis">${esc(project.systemBehaviour)}</p><span class="overview-note">Interpretation not guaranteed.</span></div>
      <dl class="metadata metadata--project">${metadataRows(project)}</dl>
    </section>

    <section class="reading-layout">
      <aside class="reading-nav"><p class="kicker">Official record / unofficial problem</p><p>Original curatorial material is preserved in its source language. English context is editorial, not a replacement.</p><span>Continue at your own discretion ↓</span></aside>
      <article class="project-reading">
        ${projectBody()}
        ${linkSection}
        ${imageSection}
      </article>
    </section>

    ${imageCreditSection}

    <a class="next-project" href="${pageUrl(`projects/${project.slug}/index.html`, `projects/${nextProject.slug}/index.html`)}">
      <span>Next project</span><strong>${esc(displayTitle(nextProject))}</strong><i>→</i>
    </a>`
  });
}

function notFoundPage() {
  return layout({
    filePath: "404.html",
    title: "Not found",
    description: "This record is not currently available.",
    body: `<section class="not-found">
      <p class="eyebrow"><span>404</span><span>Record not found</span></p>
      <h1>This page has not passed the application process.</h1>
      <p>It may have moved, changed its title, or failed to secure institutional confidence.</p>
      <a class="arrow-link" href="index.html">Return to the index <span>↗</span></a>
    </section>`
  });
}

function aboutPage() {
  return layout({
    filePath: "about/index.html",
    title: "About",
    description: "Biography and curatorial statement for Lianyi Wang.",
    active: "about",
    body: `<header class="about-hero">
      <p class="eyebrow"><span>About</span><span>${esc(site.location)}</span></p>
      <h1>Curatorial practice as <em>operating environment.</em></h1>
      <div class="about-axis" aria-hidden="true"><span>ART</span><i></i><b>↔</b><i></i><span>SYSTEM</span></div>
    </header>
    <section class="about-body">
      <aside><p class="kicker">Biography / 01</p><dl class="metadata"><div><dt>LOCATION</dt><dd>${esc(site.locationDisplayEn)}</dd></div><div><dt>EDUCATION</dt><dd>${esc(site.education)}</dd></div></dl></aside>
      <article class="prose prose--lead">${site.bio.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</article>
    </section>
    <section class="statement-grid">
      <p class="kicker">Approach / 02</p>
      ${site.statement.map((paragraph, index) => `<article><span>${indexNumber(index)}</span><p>${esc(paragraph)}</p></article>`).join("")}
    </section>
    <section class="research-section about-research">
      <div class="section-heading"><div><p class="kicker">Research / 03</p><h2>Fields in circulation</h2></div><p>Not categories. Coordinates.</p></div>
      <ol class="research-list">${site.fields.map((field, index) => `<li><span>${indexNumber(index)}</span><strong>${esc(field)}</strong><i>↗</i></li>`).join("")}</ol>
    </section>`
  });
}

function writingPage() {
  const writingItems = Array.isArray(site.writing) ? site.writing : [];
  const writingRegister = writingItems.length
    ? `<div class="line-list">${writingItems.map((item, index) => {
        const heading = item.slug
          ? `<a href="${pageUrl("writing/index.html", `writing/${item.slug}/index.html`)}">${esc(item.title)} ↗</a>`
          : item.url
            ? `<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.title)} ↗</a>`
            : esc(item.title);
        const meta = [indexNumber(index), item.type, item.date || item.year].filter(Boolean).join(" / ");
        return `<article class="line-item"><div class="tiny-meta">${esc(meta)}</div><div><h2>${heading}</h2>${item.summary ? `<p>${esc(item.summary)}</p>` : ""}${item.status ? `<span class="writing-status">${esc(item.status)}</span>` : ""}</div></article>`;
      }).join("")}</div>`
    : `<div class="editorial-placeholder"><span>01—04</span><p>${esc(site.writingPlan)}</p><b>Selection pending</b></div>`;

  return layout({
    filePath: "writing/index.html",
    title: "Writing / Talks",
    description: "Selected writing and public conversations by Lianyi Wang.",
    active: "writing",
    body: `<header class="writing-hero">
      <p class="eyebrow"><span>Writing / Talks</span><span>Text selection: confirmed</span></p>
      <h1>Words, talks, and other <em>public evidence.</em></h1>
      <p>${esc(site.writingPlan)}</p>
    </header>
    <section class="writing-section">
      <div class="section-heading section-heading--compact"><div><p class="kicker">Writing / 01</p><h2>Four selected texts.</h2></div><p>All four Chinese texts are online.</p></div>
      ${writingRegister}
    </section>
    <section class="talks-section">
      <p class="kicker">Talks / 02</p>
      <div><h2>Public conversations, selectively documented.</h2><p>Talk records will be added selectively rather than as a complete speaking history.</p><span>Under editorial review</span></div>
    </section>`
  });
}

async function writingArticlePage(item) {
  const filePath = `writing/${item.slug}/index.html`;
  const source = await readFile(join(root, item.contentFile), "utf8");
  const assetRoot = item.assetDir ? pageUrl(filePath, `assets/writing/${item.assetDir}/`) : "";
  const articleBody = source.replaceAll("@@ASSET_PREFIX@@", assetRoot);
  const articleVisual = item.cover && item.assetDir
    ? `<figure class="article-cover"><img src="${assetRoot}${esc(item.cover)}" alt="${esc(item.titleZh || item.title)}" width="1800" height="900"><figcaption>${esc(item.coverCaption || item.type)}</figcaption></figure>`
    : `<div class="article-title-panel" aria-hidden="true"><span>TEXT RECORD / ${esc(item.date)}</span><strong>${esc(item.visualLabel || item.type)}</strong><i>ACCESS GRANTED / IMAGE FILE: NOT REQUIRED</i></div>`;
  const sourceLinks = [
    item.sourceUrl ? `<a class="source-link" href="${esc(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(item.sourceLabel || "Original text archive ↗")}</a>` : "",
    item.archiveUrl ? `<a class="source-link" href="${esc(item.archiveUrl)}" target="_blank" rel="noopener noreferrer">${esc(item.archiveLabel || "Archive copy ↗")}</a>` : ""
  ].filter(Boolean).join("");

  return layout({
    filePath,
    title: item.title,
    description: item.summaryZh || item.summary,
    active: "writing",
    body: `<article class="writing-article">
      <a class="article-back" href="${pageUrl(filePath, "writing/index.html")}">← Writing / Talks</a>
      <header class="writing-article-hero">
        <p class="eyebrow"><span>Article record</span><span>${esc(item.status)}</span></p>
        <h1 lang="zh-Hans">${esc(item.titleZh || item.title)}</h1>
        <p class="article-deck">This page preserves the Chinese original; the English version is forthcoming.</p>
        ${articleVisual}
      </header>
      <div class="writing-article-grid">
        <aside class="article-filing">
          <p class="kicker">Article record</p>
          <dl class="metadata">
            <div><dt>Author</dt><dd>${esc(site.name)} / ${esc(site.nameZh)}</dd></div>
            <div><dt>Published</dt><dd>${esc(item.date)}</dd></div>
            <div><dt>Filed under</dt><dd>${esc(item.type)}</dd></div>
            <div><dt>Language</dt><dd>Chinese original</dd></div>
            <div><dt>Copyright</dt><dd>Original work by Lianyi Wang. All rights reserved.</dd></div>
          </dl>
          <div class="article-source-links">${sourceLinks}</div>
        </aside>
        <div class="writing-article-body" lang="zh-Hans">${articleBody}</div>
      </div>
    </article>`
  });
}

function contactPage() {
  const socials = site.social.map((item, index) => {
    if (!item.url) return "";
    const display = item.handle ? `${item.label} · ${item.handle}` : item.label;
    return `<a class="contact-line" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer"><span>${indexNumber(index + 1)} / Social</span><strong>${esc(display)}</strong><i>↗</i></a>`;
  }).join("");
  const emailMarkup = site.email.includes("@")
    ? `<a class="contact-line" href="mailto:${esc(site.email)}"><span>01 / Email</span><strong>${esc(site.email)}</strong><i>↗</i></a>`
    : esc(site.email);
  return layout({
    filePath: "contact/index.html",
    title: "Contact",
    description: "Contact Lianyi Wang.",
    active: "contact",
    body: `<header class="contact-hero">
      <p class="eyebrow"><span>Contact</span><span>Public access: granted</span></p>
      <h1>Direct access, no application required.</h1>
      <p>For projects, research and conversations.</p>
    </header>
    <section class="contact-register">
      ${emailMarkup}
      ${socials}
      <div class="contact-line"><span>03 / Location</span><strong>${esc(site.locationDisplayEn)}</strong><i>●</i></div>
    </section>`
  });
}

async function writePage(filePath, html) {
  const target = join(outDir, filePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html);
}

async function copyProjectAssets() {
  const source = join(root, "src/assets/projects");
  try {
    await access(source);
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  await cp(source, join(outDir, "assets/projects"), { recursive: true });
}

async function copyWritingAssets() {
  const source = join(root, "src/assets/writing");
  try {
    await access(source);
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  await cp(source, join(outDir, "assets/writing"), { recursive: true });
}

await rm(outDir, { recursive: true, force: true });
await mkdir(join(outDir, "assets"), { recursive: true });
await copyFile(join(root, "src/styles/site.css"), join(outDir, "assets/site.css"));
await copyFile(join(root, "src/scripts/archive.js"), join(outDir, "assets/archive.js"));
await copyFile(join(root, "src/assets/favicon.svg"), join(outDir, "assets/favicon.svg"));
await copyProjectAssets();
await copyWritingAssets();

await writePage("index.html", homePage());
await writePage("404.html", notFoundPage());
await writeFile(join(outDir, "robots.txt"), "User-agent: *\nDisallow: /\n");
await writeFile(join(outDir, ".nojekyll"), "");
await writePage("projects/index.html", projectsPage());
await Promise.all(projects.filter(isPublicProject).map((project) => writePage(`projects/${project.slug}/index.html`, projectPage(project))));
await writePage("about/index.html", aboutPage());
if (hasWritingPage()) {
  await writePage("writing/index.html", writingPage());
  await Promise.all(
    (site.writing || [])
      .filter((item) => item.slug && item.contentFile)
      .map(async (item) => writePage(`writing/${item.slug}/index.html`, await writingArticlePage(item)))
  );
}
if (hasContactPage()) {
  await writePage("contact/index.html", contactPage());
}
