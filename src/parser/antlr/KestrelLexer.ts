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
	public static readonly ID = 29;
	public static readonly INT = 30;
	public static readonly CHAR = 31;
	public static readonly STRING = 32;
	public static readonly FLOAT = 33;
	public static readonly NEWLINE = 34;
	public static readonly WS = 35;
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
                                                            "'('", "')'", 
                                                            "','", "'{'", 
                                                            "'}'", "'fn'", 
                                                            "';'" ];
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
		"T__25", "T__26", "T__27", "ID", "INT", "CHAR", "STRING", "FLOAT", "NEWLINE", 
		"WS",
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

	public static readonly _serializedATN: number[] = [4,0,35,195,6,-1,2,0,
	7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,
	7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,
	16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,
	2,24,7,24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,
	31,7,31,2,32,7,32,2,33,7,33,2,34,7,34,1,0,1,0,1,0,1,0,1,1,1,1,1,2,1,2,1,
	3,1,3,1,4,1,4,1,5,1,5,1,5,1,6,1,6,1,6,1,7,1,7,1,8,1,8,1,9,1,9,1,10,1,10,
	1,10,1,11,1,11,1,11,1,12,1,12,1,12,1,13,1,13,1,13,1,14,1,14,1,14,1,15,1,
	15,1,16,1,16,1,16,1,17,1,17,1,18,1,18,1,18,1,19,1,19,1,19,1,20,1,20,1,20,
	1,21,1,21,1,22,1,22,1,23,1,23,1,24,1,24,1,25,1,25,1,26,1,26,1,26,1,27,1,
	27,1,28,4,28,143,8,28,11,28,12,28,144,1,29,4,29,148,8,29,11,29,12,29,149,
	1,30,1,30,5,30,154,8,30,10,30,12,30,157,9,30,1,30,1,30,1,31,1,31,5,31,163,
	8,31,10,31,12,31,166,9,31,1,31,1,31,1,32,5,32,171,8,32,10,32,12,32,174,
	9,32,1,32,1,32,4,32,178,8,32,11,32,12,32,179,1,33,3,33,183,8,33,1,33,1,
	33,1,33,1,33,1,34,4,34,190,8,34,11,34,12,34,191,1,34,1,34,0,0,35,1,1,3,
	2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,11,23,12,25,13,27,14,29,15,31,
	16,33,17,35,18,37,19,39,20,41,21,43,22,45,23,47,24,49,25,51,26,53,27,55,
	28,57,29,59,30,61,31,63,32,65,33,67,34,69,35,1,0,5,2,0,95,95,97,122,1,0,
	48,57,1,0,39,39,1,0,34,34,3,0,9,10,13,13,32,32,202,0,1,1,0,0,0,0,3,1,0,
	0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,
	1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,0,0,21,1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,
	0,0,27,1,0,0,0,0,29,1,0,0,0,0,31,1,0,0,0,0,33,1,0,0,0,0,35,1,0,0,0,0,37,
	1,0,0,0,0,39,1,0,0,0,0,41,1,0,0,0,0,43,1,0,0,0,0,45,1,0,0,0,0,47,1,0,0,
	0,0,49,1,0,0,0,0,51,1,0,0,0,0,53,1,0,0,0,0,55,1,0,0,0,0,57,1,0,0,0,0,59,
	1,0,0,0,0,61,1,0,0,0,0,63,1,0,0,0,0,65,1,0,0,0,0,67,1,0,0,0,0,69,1,0,0,
	0,1,71,1,0,0,0,3,75,1,0,0,0,5,77,1,0,0,0,7,79,1,0,0,0,9,81,1,0,0,0,11,83,
	1,0,0,0,13,86,1,0,0,0,15,89,1,0,0,0,17,91,1,0,0,0,19,93,1,0,0,0,21,95,1,
	0,0,0,23,98,1,0,0,0,25,101,1,0,0,0,27,104,1,0,0,0,29,107,1,0,0,0,31,110,
	1,0,0,0,33,112,1,0,0,0,35,115,1,0,0,0,37,117,1,0,0,0,39,120,1,0,0,0,41,
	123,1,0,0,0,43,126,1,0,0,0,45,128,1,0,0,0,47,130,1,0,0,0,49,132,1,0,0,0,
	51,134,1,0,0,0,53,136,1,0,0,0,55,139,1,0,0,0,57,142,1,0,0,0,59,147,1,0,
	0,0,61,151,1,0,0,0,63,160,1,0,0,0,65,172,1,0,0,0,67,182,1,0,0,0,69,189,
	1,0,0,0,71,72,5,108,0,0,72,73,5,101,0,0,73,74,5,116,0,0,74,2,1,0,0,0,75,
	76,5,61,0,0,76,4,1,0,0,0,77,78,5,33,0,0,78,6,1,0,0,0,79,80,5,42,0,0,80,
	8,1,0,0,0,81,82,5,47,0,0,82,10,1,0,0,0,83,84,5,42,0,0,84,85,5,46,0,0,85,
	12,1,0,0,0,86,87,5,47,0,0,87,88,5,46,0,0,88,14,1,0,0,0,89,90,5,37,0,0,90,
	16,1,0,0,0,91,92,5,43,0,0,92,18,1,0,0,0,93,94,5,45,0,0,94,20,1,0,0,0,95,
	96,5,43,0,0,96,97,5,46,0,0,97,22,1,0,0,0,98,99,5,45,0,0,99,100,5,46,0,0,
	100,24,1,0,0,0,101,102,5,43,0,0,102,103,5,43,0,0,103,26,1,0,0,0,104,105,
	5,61,0,0,105,106,5,61,0,0,106,28,1,0,0,0,107,108,5,33,0,0,108,109,5,61,
	0,0,109,30,1,0,0,0,110,111,5,60,0,0,111,32,1,0,0,0,112,113,5,60,0,0,113,
	114,5,61,0,0,114,34,1,0,0,0,115,116,5,62,0,0,116,36,1,0,0,0,117,118,5,62,
	0,0,118,119,5,61,0,0,119,38,1,0,0,0,120,121,5,124,0,0,121,122,5,124,0,0,
	122,40,1,0,0,0,123,124,5,38,0,0,124,125,5,38,0,0,125,42,1,0,0,0,126,127,
	5,40,0,0,127,44,1,0,0,0,128,129,5,41,0,0,129,46,1,0,0,0,130,131,5,44,0,
	0,131,48,1,0,0,0,132,133,5,123,0,0,133,50,1,0,0,0,134,135,5,125,0,0,135,
	52,1,0,0,0,136,137,5,102,0,0,137,138,5,110,0,0,138,54,1,0,0,0,139,140,5,
	59,0,0,140,56,1,0,0,0,141,143,7,0,0,0,142,141,1,0,0,0,143,144,1,0,0,0,144,
	142,1,0,0,0,144,145,1,0,0,0,145,58,1,0,0,0,146,148,7,1,0,0,147,146,1,0,
	0,0,148,149,1,0,0,0,149,147,1,0,0,0,149,150,1,0,0,0,150,60,1,0,0,0,151,
	155,5,39,0,0,152,154,8,2,0,0,153,152,1,0,0,0,154,157,1,0,0,0,155,153,1,
	0,0,0,155,156,1,0,0,0,156,158,1,0,0,0,157,155,1,0,0,0,158,159,5,39,0,0,
	159,62,1,0,0,0,160,164,5,34,0,0,161,163,8,3,0,0,162,161,1,0,0,0,163,166,
	1,0,0,0,164,162,1,0,0,0,164,165,1,0,0,0,165,167,1,0,0,0,166,164,1,0,0,0,
	167,168,5,34,0,0,168,64,1,0,0,0,169,171,7,1,0,0,170,169,1,0,0,0,171,174,
	1,0,0,0,172,170,1,0,0,0,172,173,1,0,0,0,173,175,1,0,0,0,174,172,1,0,0,0,
	175,177,5,46,0,0,176,178,7,1,0,0,177,176,1,0,0,0,178,179,1,0,0,0,179,177,
	1,0,0,0,179,180,1,0,0,0,180,66,1,0,0,0,181,183,5,13,0,0,182,181,1,0,0,0,
	182,183,1,0,0,0,183,184,1,0,0,0,184,185,5,10,0,0,185,186,1,0,0,0,186,187,
	6,33,0,0,187,68,1,0,0,0,188,190,7,4,0,0,189,188,1,0,0,0,190,191,1,0,0,0,
	191,189,1,0,0,0,191,192,1,0,0,0,192,193,1,0,0,0,193,194,6,34,0,0,194,70,
	1,0,0,0,9,0,144,149,155,164,172,179,182,191,1,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!KestrelLexer.__ATN) {
			KestrelLexer.__ATN = new ATNDeserializer().deserialize(KestrelLexer._serializedATN);
		}

		return KestrelLexer.__ATN;
	}


	static DecisionsToDFA = KestrelLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}