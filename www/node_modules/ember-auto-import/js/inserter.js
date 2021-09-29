"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inserter = void 0;
const broccoli_plugin_1 = __importDefault(require("broccoli-plugin"));
const debug_1 = __importDefault(require("debug"));
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const parse5_1 = __importDefault(require("parse5"));
const debug = debug_1.default('ember-auto-import:inserter');
class Inserter extends broccoli_plugin_1.default {
    constructor(allApp, bundler, config, options) {
        super([allApp], {
            annotation: 'ember-auto-import-inserter',
        });
        this.bundler = bundler;
        this.config = config;
        this.options = options;
    }
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            let fastbootInfo = this.fastbootManifestInfo();
            let chunks = this.categorizeChunks();
            for (let filename of this.config.htmlEntrypoints()) {
                let fullName = path_1.join(this.inputPaths[0], filename);
                if (fs_1.existsSync(fullName)) {
                    this.processHTML(filename, fullName, fastbootInfo, chunks);
                }
            }
            if (fastbootInfo && !fastbootInfo.readsHTML) {
                // we need to add our chunks to the fastboot manifest, because this
                // version of fastboot doesn't look for scripts in HTML.
                let assets = this.bundler.buildResult.entrypoints.get('app');
                if (assets) {
                    for (let asset of assets) {
                        fastbootInfo.vendorFiles.push(asset);
                    }
                }
                for (let asset of this.bundler.buildResult.lazyAssets) {
                    fastbootInfo.vendorFiles.push(asset);
                }
                fs_extra_1.writeJSONSync(path_1.join(this.outputPath, 'package.json'), fastbootInfo.pkg);
            }
        });
    }
    processHTML(filename, fullName, fastbootInfo, targets) {
        debug(`parsing %s`, filename);
        let html = fs_1.readFileSync(fullName, 'utf8');
        let ast = parse5_1.default.parse(html, { sourceCodeLocationInfo: true });
        let stringInserter = new StringInserter(html);
        if (this.options.insertScriptsAt) {
            debug(`looking for custom script element: %s`, this.options.insertScriptsAt);
        }
        else {
            debug(`looking for scripts with src: %s`, targets.scripts.map(s => s.afterFile).filter(Boolean));
        }
        if (this.options.insertStylesAt) {
            debug(`looking for custom style element: %s`, this.options.insertStylesAt);
        }
        else {
            debug(`looking for link with href: %s`, targets.styles.map(s => s.afterFile).filter(Boolean));
        }
        traverse(ast, element => {
            var _a, _b;
            if (this.options.insertScriptsAt) {
                if (element.tagName === this.options.insertScriptsAt) {
                    let entrypoint = element.attrs.find(a => a.name === 'entrypoint');
                    if (!entrypoint) {
                        throw new Error(`<${element.tagName}/> element in ${filename} is missing required entrypoint attribute`);
                    }
                    this.replaceCustomScript(targets, fastbootInfo, stringInserter, element, entrypoint.value);
                }
            }
            else if (element.tagName === 'script') {
                let src = (_a = element.attrs.find(a => a.name === 'src')) === null || _a === void 0 ? void 0 : _a.value;
                if (src) {
                    debug(`found script with src=%s`, src);
                    this.insertScripts(targets, fastbootInfo, stringInserter, element, src);
                }
            }
            if (this.options.insertStylesAt) {
                if (element.tagName === this.options.insertStylesAt) {
                    let entrypoint = element.attrs.find(a => a.name === 'entrypoint');
                    if (!entrypoint) {
                        throw new Error(`<${element.tagName}/> element in ${filename} is missing required entrypoint attribute`);
                    }
                    this.replaceCustomStyle(targets, stringInserter, element, entrypoint.value);
                }
            }
            else if (element.tagName === 'link') {
                if (element.attrs.some(a => a.name === 'rel' && a.value === 'stylesheet')) {
                    let href = (_b = element.attrs.find(a => a.name === 'href')) === null || _b === void 0 ? void 0 : _b.value;
                    if (href) {
                        debug(`found stylesheet with href=%s`, href);
                        this.insertStyles(targets, stringInserter, element, href);
                    }
                }
            }
        });
        let appScripts = [...targets.scripts].find(entry => entry.bundleName === 'app');
        if (appScripts && !appScripts.inserted) {
            if (this.options.insertScriptsAt) {
                throw new Error(`ember-auto-import cannot find <${this.options.insertScriptsAt} entrypoint="${appScripts.bundleName}"> in ${filename}.`);
            }
            else {
                throw new Error(`ember-auto-import could not find a place to insert app scripts in ${filename}.`);
            }
        }
        let appStyles = [...targets.styles.values()].find(entry => entry.bundleName === 'app');
        if (appStyles && !appStyles.inserted) {
            if (this.options.insertStylesAt) {
                throw new Error(`ember-auto-import cannot find <${this.options.insertStylesAt} entrypoint="${appStyles.bundleName}"> in ${filename}.`);
            }
            else {
                throw new Error(`ember-auto-import could not find a place to insert app styles in ${filename}.`);
            }
        }
        fs_extra_1.outputFileSync(path_1.join(this.outputPath, filename), stringInserter.serialize(), 'utf8');
    }
    insertScripts(targets, fastbootInfo, stringInserter, element, src) {
        for (let entry of targets.scripts) {
            if (entry.afterFile && src.endsWith(entry.afterFile)) {
                let { scriptChunks, bundleName } = entry;
                entry.inserted = true;
                debug(`inserting %s`, scriptChunks);
                let insertedSrc = scriptChunks.map(chunk => `\n<script src="${this.chunkURL(chunk)}"></script>`).join('');
                if ((fastbootInfo === null || fastbootInfo === void 0 ? void 0 : fastbootInfo.readsHTML) && bundleName === 'app') {
                    // lazy chunks are eager in fastboot because webpack's lazy
                    // loading doesn't work in fastboot, because we share a single
                    // build with the browser and use a browser-specific
                    // lazy-loading implementation. It's probably better to make
                    // them eager on the server anyway, so they're handled as part
                    // of server startup.
                    insertedSrc += this.bundler.buildResult.lazyAssets
                        .map(chunk => `\n<fastboot-script src="${this.chunkURL(chunk)}"></fastboot-script>`)
                        .join('');
                }
                stringInserter.insert(element.sourceCodeLocation.endOffset, insertedSrc);
            }
        }
    }
    replaceCustomScript(targets, fastbootInfo, stringInserter, element, bundleName) {
        let loc = element.sourceCodeLocation;
        stringInserter.remove(loc.startOffset, loc.endOffset - loc.startOffset);
        for (let entry of targets.scripts) {
            if (bundleName !== entry.bundleName) {
                continue;
            }
            let { scriptChunks } = entry;
            entry.inserted = true;
            debug(`inserting %s`, scriptChunks);
            let tags = scriptChunks.map(chunk => this.scriptFromCustomElement(element, chunk));
            if ((fastbootInfo === null || fastbootInfo === void 0 ? void 0 : fastbootInfo.readsHTML) && bundleName === 'app') {
                // lazy chunks are eager in fastboot because webpack's lazy
                // loading doesn't work in fastboot, because we share a single
                // build with the browser and use a browser-specific
                // lazy-loading implementation. It's probably better to make
                // them eager on the server anyway, so they're handled as part
                // of server startup.
                tags = tags.concat(this.bundler.buildResult.lazyAssets.map(chunk => this.scriptFromCustomElement(element, chunk, 'fastboot-script')));
            }
            stringInserter.insert(loc.endOffset, tags.join('\n'));
        }
    }
    replaceCustomStyle(targets, stringInserter, element, bundleName) {
        let loc = element.sourceCodeLocation;
        stringInserter.remove(loc.startOffset, loc.endOffset - loc.startOffset);
        for (let entry of targets.styles) {
            if (bundleName !== entry.bundleName) {
                continue;
            }
            let { styleChunks } = entry;
            entry.inserted = true;
            debug(`inserting %s`, styleChunks);
            let tags = styleChunks.map(chunk => this.styleFromCustomElement(element, chunk));
            stringInserter.insert(loc.endOffset, tags.join('\n'));
        }
    }
    scriptFromCustomElement(element, chunk, tag = 'script') {
        let output = `<${tag} src="${this.chunkURL(chunk)}"`;
        for (let { name, value } of element.attrs) {
            if (name !== 'entrypoint') {
                output += ` ${name}`;
                if (value) {
                    output += `="${value}"`;
                }
            }
        }
        output += `></${tag}>`;
        return output;
    }
    styleFromCustomElement(element, chunk) {
        let output = `<link rel="stylesheet" href="${this.chunkURL(chunk)}"`;
        for (let { name, value } of element.attrs) {
            if (name !== 'entrypoint') {
                output += ` ${name}`;
                if (value) {
                    output += `="${value}"`;
                }
            }
        }
        output += `/>`;
        return output;
    }
    insertStyles(targets, stringInserter, element, href) {
        for (let entry of targets.styles) {
            if (entry.afterFile && href.endsWith(entry.afterFile)) {
                let { styleChunks } = entry;
                entry.inserted = true;
                debug(`inserting %s`, styleChunks);
                stringInserter.insert(element.sourceCodeLocation.endOffset, styleChunks.map(chunk => `\n<link rel="stylesheet" href="${this.chunkURL(chunk)}"/>`).join(''));
            }
        }
    }
    chunkURL(chunk) {
        return chunk.replace(/^assets\//, this.options.publicAssetURL);
    }
    fastbootManifestInfo() {
        var _a, _b;
        let pkgPath = path_1.join(this.inputPaths[0], 'package.json');
        if (!fs_1.existsSync(pkgPath)) {
            return undefined;
        }
        let pkg = fs_extra_1.readJSONSync(pkgPath);
        if (!pkg.fastboot) {
            return undefined;
        }
        if (((_a = pkg.fastboot.schemaVersion) !== null && _a !== void 0 ? _a : 0) >= 5) {
            // starting in schemaVersion 5, fastboot discovers scripts directly from
            // the HTML, so we don't need to muck about with inserting things into a
            // separate manifest
            return { readsHTML: true };
        }
        else {
            if (!((_b = pkg.fastboot.manifest) === null || _b === void 0 ? void 0 : _b.vendorFiles)) {
                throw new Error(`bug: ember-auto-import can't find the fastboot manifest vendorFiles`);
            }
            return { pkg, readsHTML: false, vendorFiles: pkg.fastboot.manifest.vendorFiles };
        }
    }
    categorizeChunks() {
        let scripts = [];
        let styles = [];
        for (let [bundleName, assets] of this.bundler.buildResult.entrypoints) {
            let scriptChunks = assets.filter(a => a.endsWith('.js'));
            if (scriptChunks.length > 0) {
                let afterFile;
                if (this.config.isBuiltInBundleName(bundleName)) {
                    afterFile = this.config.bundleEntrypoint(bundleName, 'js');
                }
                scripts.push({
                    scriptChunks,
                    bundleName,
                    afterFile,
                    inserted: false,
                });
            }
            let styleChunks = assets.filter(a => a.endsWith('.css'));
            if (styleChunks.length > 0) {
                let afterFile;
                if (this.config.isBuiltInBundleName(bundleName)) {
                    afterFile = this.config.bundleEntrypoint(bundleName, 'css');
                }
                styles.push({
                    styleChunks,
                    bundleName,
                    afterFile,
                    inserted: false,
                });
            }
        }
        return { scripts, styles };
    }
}
exports.Inserter = Inserter;
class StringInserter {
    constructor(original) {
        this.original = original;
        this.mutations = [];
    }
    insert(location, str) {
        this.mutations.push({ type: 'insert', location, str });
    }
    remove(location, length) {
        this.mutations.push({ type: 'remove', location, length });
    }
    serialize() {
        let output = [];
        let mutations = this.mutations.slice().sort((a, b) => a.location - b.location);
        let cursor = 0;
        while (mutations.length > 0) {
            let nextMutation = mutations.shift();
            output.push(this.original.slice(cursor, nextMutation.location));
            if (nextMutation.type === 'insert') {
                output.push(nextMutation.str);
                cursor = nextMutation.location;
            }
            else {
                cursor = nextMutation.location + nextMutation.length;
            }
        }
        output.push(this.original.slice(cursor));
        return output.join('');
    }
}
function traverse(node, fn) {
    if ('tagName' in node) {
        fn(node);
    }
    for (let child of node.childNodes) {
        if ('childNodes' in child) {
            traverse(child, fn);
        }
    }
}
//# sourceMappingURL=inserter.js.map