// Generated from Kestrel.g4 by ANTLR 4.13.1
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols
import {
	ATN,
	ATNDeserializer,
	CharStream,
	DecisionState, DFA,
	Lexer,
	LexerATNSimulator,
	RuleContext,
	PredictionContextCache,
	Token
} from "antlr4";
export default class KestrelLexer extends Lexer {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly T__4 = 5;
	public static readonly T__5 = 6;
	public static readonly T__6 = 7;
	public static readonly T__7 = 8;
	public static readonly T__8 = 9;
	public static readonly T__9 = 10;
	public static readonly T__10 = 11;
	public static readonly T__11 = 12;
	public static readonly T__12 = 13;
	public static readonly T__13 = 14;
	public static readonly T__14 = 15;
	public static readonly T__15 = 16;
	public static readonly T__16 = 17;
	public static readonly T__17 = 18;
	public static readonly T__18 = 19;
	public static readonly T__19 = 20;
	public static readonly T__20 = 21;
	public static readonly T__21 = 22;
	public static readonly T__22 = 23;
	public static readonly ID = 24;
	public static readonly INT = 25;
	public static readonly CHAR = 26;
	public static readonly STRING = 27;
	public static readonly FLOAT = 28;
	public static readonly NEWLINE = 29;
	public static readonly WS = 30;
	public static readonly EOF = Token.EOF;

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	public static readonly literalNames: (string | null)[] = [ null, "'let'", 
                                                            "'='", "'!'", 
                                                            "'*'", "'/'", 
                                                            "'*.'", "'/.'", 
                                                            "'%'", "'+'", 
                                                            "'-'", "'+.'", 
                                                            "'-.'", "'++'", 
                                                            "'=='", "'!='", 
                                                            "'<'", "'<='", 
                                                            "'>'", "'>='", 
                                                            "'||'", "'&&'", 
                                                            "'('", "')'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             "ID", "INT", 
                                                             "CHAR", "STRING", 
                                                             "FLOAT", "NEWLINE", 
                                                             "WS" ];
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "T__2", "T__3", "T__4", "T__5", "T__6", "T__7", "T__8", 
		"T__9", "T__10", "T__11", "T__12", "T__13", "T__14", "T__15", "T__16", 
		"T__17", "T__18", "T__19", "T__20", "T__21", "T__22", "ID", "INT", "CHAR", 
		"STRING", "FLOAT", "NEWLINE", "WS",
	];


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(this, KestrelLexer._ATN, KestrelLexer.DecisionsToDFA, new PredictionContextCache());
	}

	public get grammarFileName(): string { return "Kestrel.g4"; }

	public get literalNames(): (string | null)[] { return KestrelLexer.literalNames; }
	public get symbolicNames(): (string | null)[] { return KestrelLexer.symbolicNames; }
	public get ruleNames(): string[] { return KestrelLexer.ruleNames; }

	public get serializedATN(): number[] { return KestrelLexer._serializedATN; }

	public get channelNames(): string[] { return KestrelLexer.channelNames; }

	public get modeNames(): string[] { return KestrelLexer.modeNames; }

	public static readonly _serializedATN: number[] = [4,0,30,172,6,-1,2,0,
	7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,
	7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,
	16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,
	2,24,7,24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,1,0,1,0,1,0,
	1,0,1,1,1,1,1,2,1,2,1,3,1,3,1,4,1,4,1,5,1,5,1,5,1,6,1,6,1,6,1,7,1,7,1,8,
	1,8,1,9,1,9,1,10,1,10,1,10,1,11,1,11,1,11,1,12,1,12,1,12,1,13,1,13,1,13,
	1,14,1,14,1,14,1,15,1,15,1,16,1,16,1,16,1,17,1,17,1,18,1,18,1,18,1,19,1,
	19,1,19,1,20,1,20,1,20,1,21,1,21,1,22,1,22,1,23,4,23,122,8,23,11,23,12,
	23,123,1,24,4,24,127,8,24,11,24,12,24,128,1,25,1,25,5,25,133,8,25,10,25,
	12,25,136,9,25,1,25,1,25,1,26,1,26,5,26,142,8,26,10,26,12,26,145,9,26,1,
	26,1,26,1,27,5,27,150,8,27,10,27,12,27,153,9,27,1,27,1,27,4,27,157,8,27,
	11,27,12,27,158,1,28,3,28,162,8,28,1,28,1,28,1,29,4,29,167,8,29,11,29,12,
	29,168,1,29,1,29,0,0,30,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,
	11,23,12,25,13,27,14,29,15,31,16,33,17,35,18,37,19,39,20,41,21,43,22,45,
	23,47,24,49,25,51,26,53,27,55,28,57,29,59,30,1,0,5,2,0,95,95,97,122,1,0,
	48,57,1,0,39,39,1,0,34,34,3,0,9,10,13,13,32,32,179,0,1,1,0,0,0,0,3,1,0,
	0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,
	1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,0,0,21,1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,
	0,0,27,1,0,0,0,0,29,1,0,0,0,0,31,1,0,0,0,0,33,1,0,0,0,0,35,1,0,0,0,0,37,
	1,0,0,0,0,39,1,0,0,0,0,41,1,0,0,0,0,43,1,0,0,0,0,45,1,0,0,0,0,47,1,0,0,
	0,0,49,1,0,0,0,0,51,1,0,0,0,0,53,1,0,0,0,0,55,1,0,0,0,0,57,1,0,0,0,0,59,
	1,0,0,0,1,61,1,0,0,0,3,65,1,0,0,0,5,67,1,0,0,0,7,69,1,0,0,0,9,71,1,0,0,
	0,11,73,1,0,0,0,13,76,1,0,0,0,15,79,1,0,0,0,17,81,1,0,0,0,19,83,1,0,0,0,
	21,85,1,0,0,0,23,88,1,0,0,0,25,91,1,0,0,0,27,94,1,0,0,0,29,97,1,0,0,0,31,
	100,1,0,0,0,33,102,1,0,0,0,35,105,1,0,0,0,37,107,1,0,0,0,39,110,1,0,0,0,
	41,113,1,0,0,0,43,116,1,0,0,0,45,118,1,0,0,0,47,121,1,0,0,0,49,126,1,0,
	0,0,51,130,1,0,0,0,53,139,1,0,0,0,55,151,1,0,0,0,57,161,1,0,0,0,59,166,
	1,0,0,0,61,62,5,108,0,0,62,63,5,101,0,0,63,64,5,116,0,0,64,2,1,0,0,0,65,
	66,5,61,0,0,66,4,1,0,0,0,67,68,5,33,0,0,68,6,1,0,0,0,69,70,5,42,0,0,70,
	8,1,0,0,0,71,72,5,47,0,0,72,10,1,0,0,0,73,74,5,42,0,0,74,75,5,46,0,0,75,
	12,1,0,0,0,76,77,5,47,0,0,77,78,5,46,0,0,78,14,1,0,0,0,79,80,5,37,0,0,80,
	16,1,0,0,0,81,82,5,43,0,0,82,18,1,0,0,0,83,84,5,45,0,0,84,20,1,0,0,0,85,
	86,5,43,0,0,86,87,5,46,0,0,87,22,1,0,0,0,88,89,5,45,0,0,89,90,5,46,0,0,
	90,24,1,0,0,0,91,92,5,43,0,0,92,93,5,43,0,0,93,26,1,0,0,0,94,95,5,61,0,
	0,95,96,5,61,0,0,96,28,1,0,0,0,97,98,5,33,0,0,98,99,5,61,0,0,99,30,1,0,
	0,0,100,101,5,60,0,0,101,32,1,0,0,0,102,103,5,60,0,0,103,104,5,61,0,0,104,
	34,1,0,0,0,105,106,5,62,0,0,106,36,1,0,0,0,107,108,5,62,0,0,108,109,5,61,
	0,0,109,38,1,0,0,0,110,111,5,124,0,0,111,112,5,124,0,0,112,40,1,0,0,0,113,
	114,5,38,0,0,114,115,5,38,0,0,115,42,1,0,0,0,116,117,5,40,0,0,117,44,1,
	0,0,0,118,119,5,41,0,0,119,46,1,0,0,0,120,122,7,0,0,0,121,120,1,0,0,0,122,
	123,1,0,0,0,123,121,1,0,0,0,123,124,1,0,0,0,124,48,1,0,0,0,125,127,7,1,
	0,0,126,125,1,0,0,0,127,128,1,0,0,0,128,126,1,0,0,0,128,129,1,0,0,0,129,
	50,1,0,0,0,130,134,5,39,0,0,131,133,8,2,0,0,132,131,1,0,0,0,133,136,1,0,
	0,0,134,132,1,0,0,0,134,135,1,0,0,0,135,137,1,0,0,0,136,134,1,0,0,0,137,
	138,5,39,0,0,138,52,1,0,0,0,139,143,5,34,0,0,140,142,8,3,0,0,141,140,1,
	0,0,0,142,145,1,0,0,0,143,141,1,0,0,0,143,144,1,0,0,0,144,146,1,0,0,0,145,
	143,1,0,0,0,146,147,5,34,0,0,147,54,1,0,0,0,148,150,7,1,0,0,149,148,1,0,
	0,0,150,153,1,0,0,0,151,149,1,0,0,0,151,152,1,0,0,0,152,154,1,0,0,0,153,
	151,1,0,0,0,154,156,5,46,0,0,155,157,7,1,0,0,156,155,1,0,0,0,157,158,1,
	0,0,0,158,156,1,0,0,0,158,159,1,0,0,0,159,56,1,0,0,0,160,162,5,13,0,0,161,
	160,1,0,0,0,161,162,1,0,0,0,162,163,1,0,0,0,163,164,5,10,0,0,164,58,1,0,
	0,0,165,167,7,4,0,0,166,165,1,0,0,0,167,168,1,0,0,0,168,166,1,0,0,0,168,
	169,1,0,0,0,169,170,1,0,0,0,170,171,6,29,0,0,171,60,1,0,0,0,9,0,123,128,
	134,143,151,158,161,168,1,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!KestrelLexer.__ATN) {
			KestrelLexer.__ATN = new ATNDeserializer().deserialize(KestrelLexer._serializedATN);
		}

		return KestrelLexer.__ATN;
	}


	static DecisionsToDFA = KestrelLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}