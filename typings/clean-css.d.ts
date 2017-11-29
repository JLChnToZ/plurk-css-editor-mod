// Type definitions for clean-css v4.1.9
// Project: https://github.com/jakubpawlowicz/clean-css
// Definitions by: Jeremy Lam "JLChnToZ" <https://github.com/jlchntoz>

declare namespace CleanCSS {
  interface Options {
    compatibility?: string | CompatibilityOptions,
    fetch?(uri: string, inlineRequest: boolean, inlineTimeout: number, callback: (err: any, body: string) => void): void,
    format?: false | FormatOptions;
    inline?: false | string[];
    inlineTimeout?: number;
    inlineRequest?: any;
    level?: number | AdvancedOptimizationOptions;
    rebase?: boolean;
    rebaseTo?: string;
    returnPromise?: boolean;
    sourceMap?: boolean;
    sourceMapInlineSources?: boolean;
  }

  interface CompatibilityOptions {
    colors?: ColorsCompatibilityOptions;
    properties?: PropertiesCompatibilityOptions;
    selectors?: SelectorsCompatibilityOptions;
    units?: UnitsCompatibilityOptions;
  }

  interface ColorsCompatibilityOptions {
    opacity?: boolean;
  }

  interface PropertiesCompatibilityOptions {
    backgroundClipMerging?: boolean;
    backgroundOriginMerging?: boolean;
    backgroundSizeMerging?: boolean;
    colors?: boolean;
    ieBangHack?: boolean;
    ieFilters?: boolean;
    iePrefixHack?: boolean;
    ieSuffixHack?: boolean;
    merging?: boolean;
    shorterLengthUnits?: boolean;
    spaceAfterClosingBrace?: boolean;
    urlQuotes?: boolean;
    zeroUnits?: boolean;
  }

  interface SelectorsCompatibilityOptions {
    adjacentSpace?: boolean;
    ie7Hack?: boolean;
    mergeablePseudoClasses?: string[];
    mergeablePseudoElements?: string[];
    mergeLimit?: number;
    multiplePseudoMerging?: boolean;
  }

  interface UnitsCompatibilityOptions {
    ch?: boolean;
    in?: boolean;
    pc?: boolean;
    pt?: boolean;
    rem?: boolean;
    vh?: boolean;
    vm?: boolean;
    vmax?: boolean;
    vmin?: boolean;
  }

  type FormatOptions = 'beautify' | 'keep-breaks' | AdvancedFormatOptions;

  interface AdvancedFormatOptions {
    breaks?: BreaksFormatOptions;
    indentBy?: number;
    indentWith?: FormatIndentWith;
    spaces?: SpacesFormatOptions;
    wrapAt?: boolean;
  }

  type FormatIndentWith = 'space' | 'tab';

  interface BreaksFormatOptions {
    afterAtRule?: boolean;
    afterBlockBegins?: boolean;
    afterBlockEnds?: boolean;
    afterComment?: boolean;
    afterProperty?: boolean;
    afterRuleBegins?: boolean;
    afterRuleEnds?: boolean;
    beforeBlockEnds?: boolean;
    betweenSelectors?: boolean;
  }

  interface SpacesFormatOptions {
    aroundSelectorRelation?: boolean;
    beforeBlockBegins?: boolean;
    beforeValue?: boolean;
  }

  interface AdvancedOptimizationOptions {
    1?: OptimizationLevel1Options;
    2?: OptimizationLevel2Options;
  }

  interface OptimizationOptionsBase {
    all?: boolean;
  }

  type SelectorsSortingMethod = 'natural' | 'standard' | 'none';

  interface OptimizationLevel1Options extends OptimizationOptionsBase {
    cleanupCharsets?: boolean;
    normalizeUrls?: boolean;
    optimizeBackground?: boolean;
    optimizeBorderRadius?: boolean;
    optimizeFilter?: boolean;
    optimizeFont?: boolean;
    optimizeFontWeight?: boolean;
    optimizeOutline?: boolean;
    removeEmpty?: boolean;
    removeNegativePaddings?: boolean;
    removeQuotes?: boolean;
    removeWhitespace?: boolean;
    replaceMultipleZeros?: boolean;
    replaceTimeUnits?: boolean;
    replaceZeroUnits?: boolean;
    roundingPrecision?: boolean;
    selectorsSortingMethod?: SelectorsSortingMethod | false;
    specialComments?: string;
    tidyAtRules?: boolean;
    tidyBlockScopes?: boolean;
    tidySelectors?: boolean;
    transform?(src: string): string;
  }

  interface OptimizationLevel2Options extends OptimizationOptionsBase {
    mergeAdjacentRules?: boolean;
    mergeIntoShorthands?: boolean;
    mergeMedia?: boolean;
    mergeNonAdjacentRules?: boolean;
    mergeSemantically?: boolean;
    overrideProperties?: boolean;
    removeEmpty?: boolean;
    reduceNonAdjacentRules?: boolean;
    removeDuplicateFontRules?: boolean;
    removeDuplicateMediaBlocks?: boolean;
    removeDuplicateRules?: boolean;
    removeUnusedAtRules?: boolean;
    restructureRules?: boolean;
    skipProperties?: string[];
  }

  interface Output {
    styles: string;
    sourceMap: string;
    errors: string[];
    warnings: string[];
    stats: OutputStats;
  }

  interface OutputStats {
    originalSize: number;
    minifiedSize: number;
    timeSpent: number;
    efficiency: number;
  }

  type MultipleFileInputs = MultipleFileInput | MultipleFileInput[];

  interface MultipleFileInput {
    [path: string]: string | MultipleFileInputEntry;
  }

  interface MultipleFileInputEntry {
    styles: string;
    sourceMap?: string;
  }
}

declare class CleanCSS {
  constructor(options?: CleanCSS.Options);
  minify(
    sources: string | string[] | CleanCSS.MultipleFileInputs,
    callback?: (error: any, minified: CleanCSS.Output) => void
  ): CleanCSS.Output | Promise<CleanCSS.Output>;
}

export = CleanCSS;