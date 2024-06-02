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
	public static readonly ID = 23;
	public static readonly INT = 24;
	public static readonly CHAR = 25;
	public static readonly STRING = 26;
	public static readonly FLOAT = 27;
	public static readonly NEWLINE = 28;
	public static readonly WS = 29;
	public static readonly EOF = Token.EOF;

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	public static readonly literalNames: (string | null)[] = [ null, "'let'", 
                                                            "'='", "'*'", 
                                                            "'/'", "'*.'", 
                                                            "'/.'", "'%'", 
                                                            "'+'", "'-'", 
                                                            "'+.'", "'-.'", 
                                                            "'++'", "'=='", 
                                                            "'!='", "'<'", 
                                                            "'<='", "'>'", 
                                                            "'>='", "'||'", 
                                                            "'&&'", "'('", 
                                                            "')'" ];
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
                                                             null, "ID", 
                                                             "INT", "CHAR", 
                                                             "STRING", "FLOAT", 
                                                             "NEWLINE", 
                                                             "WS" ];
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "T__2", "T__3", "T__4", "T__5", "T__6", "T__7", "T__8", 
		"T__9", "T__10", "T__11", "T__12", "T__13", "T__14", "T__15", "T__16", 
		"T__17", "T__18", "T__19", "T__20", "T__21", "ID", "INT", "CHAR", "STRING", 
		"FLOAT", "NEWLINE", "WS",
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

	public static readonly _serializedATN: number[] = [4,0,29,168,6,-1,2,0,
	7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,
	7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,
	16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,
	2,24,7,24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,1,0,1,0,1,0,1,0,1,1,1,
	1,1,2,1,2,1,3,1,3,1,4,1,4,1,4,1,5,1,5,1,5,1,6,1,6,1,7,1,7,1,8,1,8,1,9,1,
	9,1,9,1,10,1,10,1,10,1,11,1,11,1,11,1,12,1,12,1,12,1,13,1,13,1,13,1,14,
	1,14,1,15,1,15,1,15,1,16,1,16,1,17,1,17,1,17,1,18,1,18,1,18,1,19,1,19,1,
	19,1,20,1,20,1,21,1,21,1,22,4,22,118,8,22,11,22,12,22,119,1,23,4,23,123,
	8,23,11,23,12,23,124,1,24,1,24,5,24,129,8,24,10,24,12,24,132,9,24,1,24,
	1,24,1,25,1,25,5,25,138,8,25,10,25,12,25,141,9,25,1,25,1,25,1,26,5,26,146,
	8,26,10,26,12,26,149,9,26,1,26,1,26,4,26,153,8,26,11,26,12,26,154,1,27,
	3,27,158,8,27,1,27,1,27,1,28,4,28,163,8,28,11,28,12,28,164,1,28,1,28,0,
	0,29,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,11,23,12,25,13,27,
	14,29,15,31,16,33,17,35,18,37,19,39,20,41,21,43,22,45,23,47,24,49,25,51,
	26,53,27,55,28,57,29,1,0,5,2,0,95,95,97,122,1,0,48,57,1,0,39,39,1,0,34,
	34,3,0,9,10,13,13,32,32,175,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,
	0,0,0,9,1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,
	1,0,0,0,0,21,1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,0,27,1,0,0,0,0,29,1,0,0,
	0,0,31,1,0,0,0,0,33,1,0,0,0,0,35,1,0,0,0,0,37,1,0,0,0,0,39,1,0,0,0,0,41,
	1,0,0,0,0,43,1,0,0,0,0,45,1,0,0,0,0,47,1,0,0,0,0,49,1,0,0,0,0,51,1,0,0,
	0,0,53,1,0,0,0,0,55,1,0,0,0,0,57,1,0,0,0,1,59,1,0,0,0,3,63,1,0,0,0,5,65,
	1,0,0,0,7,67,1,0,0,0,9,69,1,0,0,0,11,72,1,0,0,0,13,75,1,0,0,0,15,77,1,0,
	0,0,17,79,1,0,0,0,19,81,1,0,0,0,21,84,1,0,0,0,23,87,1,0,0,0,25,90,1,0,0,
	0,27,93,1,0,0,0,29,96,1,0,0,0,31,98,1,0,0,0,33,101,1,0,0,0,35,103,1,0,0,
	0,37,106,1,0,0,0,39,109,1,0,0,0,41,112,1,0,0,0,43,114,1,0,0,0,45,117,1,
	0,0,0,47,122,1,0,0,0,49,126,1,0,0,0,51,135,1,0,0,0,53,147,1,0,0,0,55,157,
	1,0,0,0,57,162,1,0,0,0,59,60,5,108,0,0,60,61,5,101,0,0,61,62,5,116,0,0,
	62,2,1,0,0,0,63,64,5,61,0,0,64,4,1,0,0,0,65,66,5,42,0,0,66,6,1,0,0,0,67,
	68,5,47,0,0,68,8,1,0,0,0,69,70,5,42,0,0,70,71,5,46,0,0,71,10,1,0,0,0,72,
	73,5,47,0,0,73,74,5,46,0,0,74,12,1,0,0,0,75,76,5,37,0,0,76,14,1,0,0,0,77,
	78,5,43,0,0,78,16,1,0,0,0,79,80,5,45,0,0,80,18,1,0,0,0,81,82,5,43,0,0,82,
	83,5,46,0,0,83,20,1,0,0,0,84,85,5,45,0,0,85,86,5,46,0,0,86,22,1,0,0,0,87,
	88,5,43,0,0,88,89,5,43,0,0,89,24,1,0,0,0,90,91,5,61,0,0,91,92,5,61,0,0,
	92,26,1,0,0,0,93,94,5,33,0,0,94,95,5,61,0,0,95,28,1,0,0,0,96,97,5,60,0,
	0,97,30,1,0,0,0,98,99,5,60,0,0,99,100,5,61,0,0,100,32,1,0,0,0,101,102,5,
	62,0,0,102,34,1,0,0,0,103,104,5,62,0,0,104,105,5,61,0,0,105,36,1,0,0,0,
	106,107,5,124,0,0,107,108,5,124,0,0,108,38,1,0,0,0,109,110,5,38,0,0,110,
	111,5,38,0,0,111,40,1,0,0,0,112,113,5,40,0,0,113,42,1,0,0,0,114,115,5,41,
	0,0,115,44,1,0,0,0,116,118,7,0,0,0,117,116,1,0,0,0,118,119,1,0,0,0,119,
	117,1,0,0,0,119,120,1,0,0,0,120,46,1,0,0,0,121,123,7,1,0,0,122,121,1,0,
	0,0,123,124,1,0,0,0,124,122,1,0,0,0,124,125,1,0,0,0,125,48,1,0,0,0,126,
	130,5,39,0,0,127,129,8,2,0,0,128,127,1,0,0,0,129,132,1,0,0,0,130,128,1,
	0,0,0,130,131,1,0,0,0,131,133,1,0,0,0,132,130,1,0,0,0,133,134,5,39,0,0,
	134,50,1,0,0,0,135,139,5,34,0,0,136,138,8,3,0,0,137,136,1,0,0,0,138,141,
	1,0,0,0,139,137,1,0,0,0,139,140,1,0,0,0,140,142,1,0,0,0,141,139,1,0,0,0,
	142,143,5,34,0,0,143,52,1,0,0,0,144,146,7,1,0,0,145,144,1,0,0,0,146,149,
	1,0,0,0,147,145,1,0,0,0,147,148,1,0,0,0,148,150,1,0,0,0,149,147,1,0,0,0,
	150,152,5,46,0,0,151,153,7,1,0,0,152,151,1,0,0,0,153,154,1,0,0,0,154,152,
	1,0,0,0,154,155,1,0,0,0,155,54,1,0,0,0,156,158,5,13,0,0,157,156,1,0,0,0,
	157,158,1,0,0,0,158,159,1,0,0,0,159,160,5,10,0,0,160,56,1,0,0,0,161,163,
	7,4,0,0,162,161,1,0,0,0,163,164,1,0,0,0,164,162,1,0,0,0,164,165,1,0,0,0,
	165,166,1,0,0,0,166,167,6,28,0,0,167,58,1,0,0,0,9,0,119,124,130,139,147,
	154,157,164,1,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!KestrelLexer.__ATN) {
			KestrelLexer.__ATN = new ATNDeserializer().deserialize(KestrelLexer._serializedATN);
		}

		return KestrelLexer.__ATN;
	}


	static DecisionsToDFA = KestrelLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}