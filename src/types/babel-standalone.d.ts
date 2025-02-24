declare module '@babel/standalone' {
    interface SourceMap {
        version: number;
        sources: string[];
        names: string[];
        mappings: string;
        file?: string;
        sourceRoot?: string;
        sourcesContent?: string[];
    }

    interface BabelAST {
        type: string;
        start: number;
        end: number;
        loc: {
            start: { line: number; column: number };
            end: { line: number; column: number };
        };
        program: {
            type: string;
            body: unknown[];
            directives: unknown[];
        };
    }

    interface BabelOptions {
        presets?: string[];
        plugins?: string[];
        filename?: string;
        sourceType?: 'script' | 'module';
        configFile?: string | boolean;
        babelrc?: boolean;
        [key: string]: string[] | string | boolean | undefined;
    }

    interface TransformResult {
        code: string;
        map: SourceMap | null;
        ast: BabelAST | null;
    }

    export function transform(
        code: string,
        options?: BabelOptions
    ): TransformResult;
}
