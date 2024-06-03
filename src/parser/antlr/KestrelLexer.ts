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
	public static readonly T__23 = 24;
	public static readonly T__24 = 25;
	public static readonly T__25 = 26;
	public static readonly T__26 = 27;
	public static readonly T__27 = 28;
	public static readonly T__28 = 29;
	public static readonly T__29 = 30;
	public static readonly T__30 = 31;
	public static readonly T__31 = 32;
	public static readonly ID = 33;
	public static readonly INT = 34;
	public static readonly CHAR = 35;
	public static readonly STRING = 36;
	public static readonly FLOAT = 37;
	public static readonly NEWLINE = 38;
	public static readonly WS = 39;
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
                                                            "'('", "','", 
                                                            "')'", "'fn'", 
                                                            "'if'", "'else'", 
                                                            "'['", "']'", 
                                                            "';'", "'{'", 
                                                            "'}'" ];
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
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, "ID", 
                                                             "INT", "CHAR", 
                                                             "STRING", "FLOAT", 
                                                             "NEWLINE", 
                                                             "WS" ];
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "T__2", "T__3", "T__4", "T__5", "T__6", "T__7", "T__8", 
		"T__9", "T__10", "T__11", "T__12", "T__13", "T__14", "T__15", "T__16", 
		"T__17", "T__18", "T__19", "T__20", "T__21", "T__22", "T__23", "T__24", 
		"T__25", "T__26", "T__27", "T__28", "T__29", "T__30", "T__31", "ID", "INT", 
		"CHAR", "STRING", "FLOAT", "NEWLINE", "WS",
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

	public static readonly _serializedATN: number[] = [4,0,39,215,6,-1,2,0,
	7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,
	7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,
	16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,
	2,24,7,24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,
	31,7,31,2,32,7,32,2,33,7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,
	7,38,1,0,1,0,1,0,1,0,1,1,1,1,1,2,1,2,1,3,1,3,1,4,1,4,1,5,1,5,1,5,1,6,1,
	6,1,6,1,7,1,7,1,8,1,8,1,9,1,9,1,10,1,10,1,10,1,11,1,11,1,11,1,12,1,12,1,
	12,1,13,1,13,1,13,1,14,1,14,1,14,1,15,1,15,1,16,1,16,1,16,1,17,1,17,1,18,
	1,18,1,18,1,19,1,19,1,19,1,20,1,20,1,20,1,21,1,21,1,22,1,22,1,23,1,23,1,
	24,1,24,1,24,1,25,1,25,1,25,1,26,1,26,1,26,1,26,1,26,1,27,1,27,1,28,1,28,
	1,29,1,29,1,30,1,30,1,31,1,31,1,32,4,32,163,8,32,11,32,12,32,164,1,33,4,
	33,168,8,33,11,33,12,33,169,1,34,1,34,5,34,174,8,34,10,34,12,34,177,9,34,
	1,34,1,34,1,35,1,35,5,35,183,8,35,10,35,12,35,186,9,35,1,35,1,35,1,36,5,
	36,191,8,36,10,36,12,36,194,9,36,1,36,1,36,4,36,198,8,36,11,36,12,36,199,
	1,37,3,37,203,8,37,1,37,1,37,1,37,1,37,1,38,4,38,210,8,38,11,38,12,38,211,
	1,38,1,38,0,0,39,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,11,23,
	12,25,13,27,14,29,15,31,16,33,17,35,18,37,19,39,20,41,21,43,22,45,23,47,
	24,49,25,51,26,53,27,55,28,57,29,59,30,61,31,63,32,65,33,67,34,69,35,71,
	36,73,37,75,38,77,39,1,0,5,2,0,95,95,97,122,1,0,48,57,1,0,39,39,1,0,34,
	34,3,0,9,10,13,13,32,32,222,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,
	0,0,0,9,1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,
	1,0,0,0,0,21,1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,0,27,1,0,0,0,0,29,1,0,0,
	0,0,31,1,0,0,0,0,33,1,0,0,0,0,35,1,0,0,0,0,37,1,0,0,0,0,39,1,0,0,0,0,41,
	1,0,0,0,0,43,1,0,0,0,0,45,1,0,0,0,0,47,1,0,0,0,0,49,1,0,0,0,0,51,1,0,0,
	0,0,53,1,0,0,0,0,55,1,0,0,0,0,57,1,0,0,0,0,59,1,0,0,0,0,61,1,0,0,0,0,63,
	1,0,0,0,0,65,1,0,0,0,0,67,1,0,0,0,0,69,1,0,0,0,0,71,1,0,0,0,0,73,1,0,0,
	0,0,75,1,0,0,0,0,77,1,0,0,0,1,79,1,0,0,0,3,83,1,0,0,0,5,85,1,0,0,0,7,87,
	1,0,0,0,9,89,1,0,0,0,11,91,1,0,0,0,13,94,1,0,0,0,15,97,1,0,0,0,17,99,1,
	0,0,0,19,101,1,0,0,0,21,103,1,0,0,0,23,106,1,0,0,0,25,109,1,0,0,0,27,112,
	1,0,0,0,29,115,1,0,0,0,31,118,1,0,0,0,33,120,1,0,0,0,35,123,1,0,0,0,37,
	125,1,0,0,0,39,128,1,0,0,0,41,131,1,0,0,0,43,134,1,0,0,0,45,136,1,0,0,0,
	47,138,1,0,0,0,49,140,1,0,0,0,51,143,1,0,0,0,53,146,1,0,0,0,55,151,1,0,
	0,0,57,153,1,0,0,0,59,155,1,0,0,0,61,157,1,0,0,0,63,159,1,0,0,0,65,162,
	1,0,0,0,67,167,1,0,0,0,69,171,1,0,0,0,71,180,1,0,0,0,73,192,1,0,0,0,75,
	202,1,0,0,0,77,209,1,0,0,0,79,80,5,108,0,0,80,81,5,101,0,0,81,82,5,116,
	0,0,82,2,1,0,0,0,83,84,5,61,0,0,84,4,1,0,0,0,85,86,5,33,0,0,86,6,1,0,0,
	0,87,88,5,42,0,0,88,8,1,0,0,0,89,90,5,47,0,0,90,10,1,0,0,0,91,92,5,42,0,
	0,92,93,5,46,0,0,93,12,1,0,0,0,94,95,5,47,0,0,95,96,5,46,0,0,96,14,1,0,
	0,0,97,98,5,37,0,0,98,16,1,0,0,0,99,100,5,43,0,0,100,18,1,0,0,0,101,102,
	5,45,0,0,102,20,1,0,0,0,103,104,5,43,0,0,104,105,5,46,0,0,105,22,1,0,0,
	0,106,107,5,45,0,0,107,108,5,46,0,0,108,24,1,0,0,0,109,110,5,43,0,0,110,
	111,5,43,0,0,111,26,1,0,0,0,112,113,5,61,0,0,113,114,5,61,0,0,114,28,1,
	0,0,0,115,116,5,33,0,0,116,117,5,61,0,0,117,30,1,0,0,0,118,119,5,60,0,0,
	119,32,1,0,0,0,120,121,5,60,0,0,121,122,5,61,0,0,122,34,1,0,0,0,123,124,
	5,62,0,0,124,36,1,0,0,0,125,126,5,62,0,0,126,127,5,61,0,0,127,38,1,0,0,
	0,128,129,5,124,0,0,129,130,5,124,0,0,130,40,1,0,0,0,131,132,5,38,0,0,132,
	133,5,38,0,0,133,42,1,0,0,0,134,135,5,40,0,0,135,44,1,0,0,0,136,137,5,44,
	0,0,137,46,1,0,0,0,138,139,5,41,0,0,139,48,1,0,0,0,140,141,5,102,0,0,141,
	142,5,110,0,0,142,50,1,0,0,0,143,144,5,105,0,0,144,145,5,102,0,0,145,52,
	1,0,0,0,146,147,5,101,0,0,147,148,5,108,0,0,148,149,5,115,0,0,149,150,5,
	101,0,0,150,54,1,0,0,0,151,152,5,91,0,0,152,56,1,0,0,0,153,154,5,93,0,0,
	154,58,1,0,0,0,155,156,5,59,0,0,156,60,1,0,0,0,157,158,5,123,0,0,158,62,
	1,0,0,0,159,160,5,125,0,0,160,64,1,0,0,0,161,163,7,0,0,0,162,161,1,0,0,
	0,163,164,1,0,0,0,164,162,1,0,0,0,164,165,1,0,0,0,165,66,1,0,0,0,166,168,
	7,1,0,0,167,166,1,0,0,0,168,169,1,0,0,0,169,167,1,0,0,0,169,170,1,0,0,0,
	170,68,1,0,0,0,171,175,5,39,0,0,172,174,8,2,0,0,173,172,1,0,0,0,174,177,
	1,0,0,0,175,173,1,0,0,0,175,176,1,0,0,0,176,178,1,0,0,0,177,175,1,0,0,0,
	178,179,5,39,0,0,179,70,1,0,0,0,180,184,5,34,0,0,181,183,8,3,0,0,182,181,
	1,0,0,0,183,186,1,0,0,0,184,182,1,0,0,0,184,185,1,0,0,0,185,187,1,0,0,0,
	186,184,1,0,0,0,187,188,5,34,0,0,188,72,1,0,0,0,189,191,7,1,0,0,190,189,
	1,0,0,0,191,194,1,0,0,0,192,190,1,0,0,0,192,193,1,0,0,0,193,195,1,0,0,0,
	194,192,1,0,0,0,195,197,5,46,0,0,196,198,7,1,0,0,197,196,1,0,0,0,198,199,
	1,0,0,0,199,197,1,0,0,0,199,200,1,0,0,0,200,74,1,0,0,0,201,203,5,13,0,0,
	202,201,1,0,0,0,202,203,1,0,0,0,203,204,1,0,0,0,204,205,5,10,0,0,205,206,
	1,0,0,0,206,207,6,37,0,0,207,76,1,0,0,0,208,210,7,4,0,0,209,208,1,0,0,0,
	210,211,1,0,0,0,211,209,1,0,0,0,211,212,1,0,0,0,212,213,1,0,0,0,213,214,
	6,38,0,0,214,78,1,0,0,0,9,0,164,169,175,184,192,199,202,211,1,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!KestrelLexer.__ATN) {
			KestrelLexer.__ATN = new ATNDeserializer().deserialize(KestrelLexer._serializedATN);
		}

		return KestrelLexer.__ATN;
	}


	static DecisionsToDFA = KestrelLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}