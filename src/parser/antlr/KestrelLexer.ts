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
	public static readonly T__32 = 33;
	public static readonly T__33 = 34;
	public static readonly T__34 = 35;
	public static readonly T__35 = 36;
	public static readonly T__36 = 37;
	public static readonly T__37 = 38;
	public static readonly T__38 = 39;
	public static readonly T__39 = 40;
	public static readonly LineComment = 41;
	public static readonly ID = 42;
	public static readonly TYPE_ID = 43;
	public static readonly INT = 44;
	public static readonly CHAR = 45;
	public static readonly STRING = 46;
	public static readonly FLOAT = 47;
	public static readonly NEWLINE = 48;
	public static readonly WS = 49;
	public static readonly EOF = Token.EOF;

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	public static readonly literalNames: (string | null)[] = [ null, "'let'", 
                                                            "':'", "'='", 
                                                            "'type'", "'{'", 
                                                            "'}'", "'extern'", 
                                                            "'<'", "','", 
                                                            "'>'", "'Fn'", 
                                                            "'('", "')'", 
                                                            "'->'", "'!'", 
                                                            "'*'", "'/'", 
                                                            "'*.'", "'/.'", 
                                                            "'%'", "'+'", 
                                                            "'-'", "'+.'", 
                                                            "'-.'", "'++'", 
                                                            "'::'", "'=='", 
                                                            "'!='", "'<='", 
                                                            "'>='", "'||'", 
                                                            "'&&'", "'fn'", 
                                                            "'if'", "'else'", 
                                                            "'['", "']'", 
                                                            "'|>'", "'let#'", 
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
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, "LineComment", 
                                                             "ID", "TYPE_ID", 
                                                             "INT", "CHAR", 
                                                             "STRING", "FLOAT", 
                                                             "NEWLINE", 
                                                             "WS" ];
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "T__2", "T__3", "T__4", "T__5", "T__6", "T__7", "T__8", 
		"T__9", "T__10", "T__11", "T__12", "T__13", "T__14", "T__15", "T__16", 
		"T__17", "T__18", "T__19", "T__20", "T__21", "T__22", "T__23", "T__24", 
		"T__25", "T__26", "T__27", "T__28", "T__29", "T__30", "T__31", "T__32", 
		"T__33", "T__34", "T__35", "T__36", "T__37", "T__38", "T__39", "LineComment", 
		"ID", "TYPE_ID", "INT", "CHAR", "STRING", "FLOAT", "NEWLINE", "WS",
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

	public static readonly _serializedATN: number[] = [4,0,49,288,6,-1,2,0,
	7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,
	7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,
	16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,
	2,24,7,24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,
	31,7,31,2,32,7,32,2,33,7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,
	7,38,2,39,7,39,2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,
	45,2,46,7,46,2,47,7,47,2,48,7,48,1,0,1,0,1,0,1,0,1,1,1,1,1,2,1,2,1,3,1,
	3,1,3,1,3,1,3,1,4,1,4,1,5,1,5,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,7,1,7,1,8,1,
	8,1,9,1,9,1,10,1,10,1,10,1,11,1,11,1,12,1,12,1,13,1,13,1,13,1,14,1,14,1,
	15,1,15,1,16,1,16,1,17,1,17,1,17,1,18,1,18,1,18,1,19,1,19,1,20,1,20,1,21,
	1,21,1,22,1,22,1,22,1,23,1,23,1,23,1,24,1,24,1,24,1,25,1,25,1,25,1,26,1,
	26,1,26,1,27,1,27,1,27,1,28,1,28,1,28,1,29,1,29,1,29,1,30,1,30,1,30,1,31,
	1,31,1,31,1,32,1,32,1,32,1,33,1,33,1,33,1,34,1,34,1,34,1,34,1,34,1,35,1,
	35,1,36,1,36,1,37,1,37,1,37,1,38,1,38,1,38,1,38,1,38,1,39,1,39,1,40,1,40,
	1,40,1,40,5,40,217,8,40,10,40,12,40,220,9,40,1,40,1,40,1,41,4,41,225,8,
	41,11,41,12,41,226,1,42,4,42,230,8,42,11,42,12,42,231,1,42,5,42,235,8,42,
	10,42,12,42,238,9,42,1,43,4,43,241,8,43,11,43,12,43,242,1,44,1,44,5,44,
	247,8,44,10,44,12,44,250,9,44,1,44,1,44,1,45,1,45,5,45,256,8,45,10,45,12,
	45,259,9,45,1,45,1,45,1,46,5,46,264,8,46,10,46,12,46,267,9,46,1,46,1,46,
	4,46,271,8,46,11,46,12,46,272,1,47,3,47,276,8,47,1,47,1,47,1,47,1,47,1,
	48,4,48,283,8,48,11,48,12,48,284,1,48,1,48,0,0,49,1,1,3,2,5,3,7,4,9,5,11,
	6,13,7,15,8,17,9,19,10,21,11,23,12,25,13,27,14,29,15,31,16,33,17,35,18,
	37,19,39,20,41,21,43,22,45,23,47,24,49,25,51,26,53,27,55,28,57,29,59,30,
	61,31,63,32,65,33,67,34,69,35,71,36,73,37,75,38,77,39,79,40,81,41,83,42,
	85,43,87,44,89,45,91,46,93,47,95,48,97,49,1,0,8,2,0,10,10,13,13,2,0,95,
	95,97,122,1,0,65,90,1,0,97,122,1,0,48,57,1,0,39,39,1,0,34,34,3,0,9,10,13,
	13,32,32,298,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,
	0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,0,0,21,
	1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,0,27,1,0,0,0,0,29,1,0,0,0,0,31,1,0,0,
	0,0,33,1,0,0,0,0,35,1,0,0,0,0,37,1,0,0,0,0,39,1,0,0,0,0,41,1,0,0,0,0,43,
	1,0,0,0,0,45,1,0,0,0,0,47,1,0,0,0,0,49,1,0,0,0,0,51,1,0,0,0,0,53,1,0,0,
	0,0,55,1,0,0,0,0,57,1,0,0,0,0,59,1,0,0,0,0,61,1,0,0,0,0,63,1,0,0,0,0,65,
	1,0,0,0,0,67,1,0,0,0,0,69,1,0,0,0,0,71,1,0,0,0,0,73,1,0,0,0,0,75,1,0,0,
	0,0,77,1,0,0,0,0,79,1,0,0,0,0,81,1,0,0,0,0,83,1,0,0,0,0,85,1,0,0,0,0,87,
	1,0,0,0,0,89,1,0,0,0,0,91,1,0,0,0,0,93,1,0,0,0,0,95,1,0,0,0,0,97,1,0,0,
	0,1,99,1,0,0,0,3,103,1,0,0,0,5,105,1,0,0,0,7,107,1,0,0,0,9,112,1,0,0,0,
	11,114,1,0,0,0,13,116,1,0,0,0,15,123,1,0,0,0,17,125,1,0,0,0,19,127,1,0,
	0,0,21,129,1,0,0,0,23,132,1,0,0,0,25,134,1,0,0,0,27,136,1,0,0,0,29,139,
	1,0,0,0,31,141,1,0,0,0,33,143,1,0,0,0,35,145,1,0,0,0,37,148,1,0,0,0,39,
	151,1,0,0,0,41,153,1,0,0,0,43,155,1,0,0,0,45,157,1,0,0,0,47,160,1,0,0,0,
	49,163,1,0,0,0,51,166,1,0,0,0,53,169,1,0,0,0,55,172,1,0,0,0,57,175,1,0,
	0,0,59,178,1,0,0,0,61,181,1,0,0,0,63,184,1,0,0,0,65,187,1,0,0,0,67,190,
	1,0,0,0,69,193,1,0,0,0,71,198,1,0,0,0,73,200,1,0,0,0,75,202,1,0,0,0,77,
	205,1,0,0,0,79,210,1,0,0,0,81,212,1,0,0,0,83,224,1,0,0,0,85,229,1,0,0,0,
	87,240,1,0,0,0,89,244,1,0,0,0,91,253,1,0,0,0,93,265,1,0,0,0,95,275,1,0,
	0,0,97,282,1,0,0,0,99,100,5,108,0,0,100,101,5,101,0,0,101,102,5,116,0,0,
	102,2,1,0,0,0,103,104,5,58,0,0,104,4,1,0,0,0,105,106,5,61,0,0,106,6,1,0,
	0,0,107,108,5,116,0,0,108,109,5,121,0,0,109,110,5,112,0,0,110,111,5,101,
	0,0,111,8,1,0,0,0,112,113,5,123,0,0,113,10,1,0,0,0,114,115,5,125,0,0,115,
	12,1,0,0,0,116,117,5,101,0,0,117,118,5,120,0,0,118,119,5,116,0,0,119,120,
	5,101,0,0,120,121,5,114,0,0,121,122,5,110,0,0,122,14,1,0,0,0,123,124,5,
	60,0,0,124,16,1,0,0,0,125,126,5,44,0,0,126,18,1,0,0,0,127,128,5,62,0,0,
	128,20,1,0,0,0,129,130,5,70,0,0,130,131,5,110,0,0,131,22,1,0,0,0,132,133,
	5,40,0,0,133,24,1,0,0,0,134,135,5,41,0,0,135,26,1,0,0,0,136,137,5,45,0,
	0,137,138,5,62,0,0,138,28,1,0,0,0,139,140,5,33,0,0,140,30,1,0,0,0,141,142,
	5,42,0,0,142,32,1,0,0,0,143,144,5,47,0,0,144,34,1,0,0,0,145,146,5,42,0,
	0,146,147,5,46,0,0,147,36,1,0,0,0,148,149,5,47,0,0,149,150,5,46,0,0,150,
	38,1,0,0,0,151,152,5,37,0,0,152,40,1,0,0,0,153,154,5,43,0,0,154,42,1,0,
	0,0,155,156,5,45,0,0,156,44,1,0,0,0,157,158,5,43,0,0,158,159,5,46,0,0,159,
	46,1,0,0,0,160,161,5,45,0,0,161,162,5,46,0,0,162,48,1,0,0,0,163,164,5,43,
	0,0,164,165,5,43,0,0,165,50,1,0,0,0,166,167,5,58,0,0,167,168,5,58,0,0,168,
	52,1,0,0,0,169,170,5,61,0,0,170,171,5,61,0,0,171,54,1,0,0,0,172,173,5,33,
	0,0,173,174,5,61,0,0,174,56,1,0,0,0,175,176,5,60,0,0,176,177,5,61,0,0,177,
	58,1,0,0,0,178,179,5,62,0,0,179,180,5,61,0,0,180,60,1,0,0,0,181,182,5,124,
	0,0,182,183,5,124,0,0,183,62,1,0,0,0,184,185,5,38,0,0,185,186,5,38,0,0,
	186,64,1,0,0,0,187,188,5,102,0,0,188,189,5,110,0,0,189,66,1,0,0,0,190,191,
	5,105,0,0,191,192,5,102,0,0,192,68,1,0,0,0,193,194,5,101,0,0,194,195,5,
	108,0,0,195,196,5,115,0,0,196,197,5,101,0,0,197,70,1,0,0,0,198,199,5,91,
	0,0,199,72,1,0,0,0,200,201,5,93,0,0,201,74,1,0,0,0,202,203,5,124,0,0,203,
	204,5,62,0,0,204,76,1,0,0,0,205,206,5,108,0,0,206,207,5,101,0,0,207,208,
	5,116,0,0,208,209,5,35,0,0,209,78,1,0,0,0,210,211,5,59,0,0,211,80,1,0,0,
	0,212,213,5,47,0,0,213,214,5,47,0,0,214,218,1,0,0,0,215,217,8,0,0,0,216,
	215,1,0,0,0,217,220,1,0,0,0,218,216,1,0,0,0,218,219,1,0,0,0,219,221,1,0,
	0,0,220,218,1,0,0,0,221,222,6,40,0,0,222,82,1,0,0,0,223,225,7,1,0,0,224,
	223,1,0,0,0,225,226,1,0,0,0,226,224,1,0,0,0,226,227,1,0,0,0,227,84,1,0,
	0,0,228,230,7,2,0,0,229,228,1,0,0,0,230,231,1,0,0,0,231,229,1,0,0,0,231,
	232,1,0,0,0,232,236,1,0,0,0,233,235,7,3,0,0,234,233,1,0,0,0,235,238,1,0,
	0,0,236,234,1,0,0,0,236,237,1,0,0,0,237,86,1,0,0,0,238,236,1,0,0,0,239,
	241,7,4,0,0,240,239,1,0,0,0,241,242,1,0,0,0,242,240,1,0,0,0,242,243,1,0,
	0,0,243,88,1,0,0,0,244,248,5,39,0,0,245,247,8,5,0,0,246,245,1,0,0,0,247,
	250,1,0,0,0,248,246,1,0,0,0,248,249,1,0,0,0,249,251,1,0,0,0,250,248,1,0,
	0,0,251,252,5,39,0,0,252,90,1,0,0,0,253,257,5,34,0,0,254,256,8,6,0,0,255,
	254,1,0,0,0,256,259,1,0,0,0,257,255,1,0,0,0,257,258,1,0,0,0,258,260,1,0,
	0,0,259,257,1,0,0,0,260,261,5,34,0,0,261,92,1,0,0,0,262,264,7,4,0,0,263,
	262,1,0,0,0,264,267,1,0,0,0,265,263,1,0,0,0,265,266,1,0,0,0,266,268,1,0,
	0,0,267,265,1,0,0,0,268,270,5,46,0,0,269,271,7,4,0,0,270,269,1,0,0,0,271,
	272,1,0,0,0,272,270,1,0,0,0,272,273,1,0,0,0,273,94,1,0,0,0,274,276,5,13,
	0,0,275,274,1,0,0,0,275,276,1,0,0,0,276,277,1,0,0,0,277,278,5,10,0,0,278,
	279,1,0,0,0,279,280,6,47,1,0,280,96,1,0,0,0,281,283,7,7,0,0,282,281,1,0,
	0,0,283,284,1,0,0,0,284,282,1,0,0,0,284,285,1,0,0,0,285,286,1,0,0,0,286,
	287,6,48,1,0,287,98,1,0,0,0,12,0,218,226,231,236,242,248,257,265,272,275,
	284,2,0,1,0,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!KestrelLexer.__ATN) {
			KestrelLexer.__ATN = new ATNDeserializer().deserialize(KestrelLexer._serializedATN);
		}

		return KestrelLexer.__ATN;
	}


	static DecisionsToDFA = KestrelLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}