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
	public static readonly LineComment = 39;
	public static readonly ID = 40;
	public static readonly TYPE_ID = 41;
	public static readonly INT = 42;
	public static readonly CHAR = 43;
	public static readonly STRING = 44;
	public static readonly FLOAT = 45;
	public static readonly NEWLINE = 46;
	public static readonly WS = 47;
	public static readonly EOF = Token.EOF;

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	public static readonly literalNames: (string | null)[] = [ null, "'let'", 
                                                            "':'", "'='", 
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
                                                            "'|>'", "'{'", 
                                                            "'}'", "'let#'", 
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
		"T__33", "T__34", "T__35", "T__36", "T__37", "LineComment", "ID", "TYPE_ID", 
		"INT", "CHAR", "STRING", "FLOAT", "NEWLINE", "WS",
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

	public static readonly _serializedATN: number[] = [4,0,47,272,6,-1,2,0,
	7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,
	7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,
	16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,
	2,24,7,24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,
	31,7,31,2,32,7,32,2,33,7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,
	7,38,2,39,7,39,2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,
	45,2,46,7,46,1,0,1,0,1,0,1,0,1,1,1,1,1,2,1,2,1,3,1,3,1,4,1,4,1,5,1,5,1,
	6,1,6,1,6,1,7,1,7,1,8,1,8,1,9,1,9,1,9,1,10,1,10,1,11,1,11,1,12,1,12,1,13,
	1,13,1,13,1,14,1,14,1,14,1,15,1,15,1,16,1,16,1,17,1,17,1,18,1,18,1,18,1,
	19,1,19,1,19,1,20,1,20,1,20,1,21,1,21,1,21,1,22,1,22,1,22,1,23,1,23,1,23,
	1,24,1,24,1,24,1,25,1,25,1,25,1,26,1,26,1,26,1,27,1,27,1,27,1,28,1,28,1,
	28,1,29,1,29,1,29,1,30,1,30,1,30,1,30,1,30,1,31,1,31,1,32,1,32,1,33,1,33,
	1,33,1,34,1,34,1,35,1,35,1,36,1,36,1,36,1,36,1,36,1,37,1,37,1,38,1,38,1,
	38,1,38,5,38,201,8,38,10,38,12,38,204,9,38,1,38,1,38,1,39,4,39,209,8,39,
	11,39,12,39,210,1,40,4,40,214,8,40,11,40,12,40,215,1,40,5,40,219,8,40,10,
	40,12,40,222,9,40,1,41,4,41,225,8,41,11,41,12,41,226,1,42,1,42,5,42,231,
	8,42,10,42,12,42,234,9,42,1,42,1,42,1,43,1,43,5,43,240,8,43,10,43,12,43,
	243,9,43,1,43,1,43,1,44,5,44,248,8,44,10,44,12,44,251,9,44,1,44,1,44,4,
	44,255,8,44,11,44,12,44,256,1,45,3,45,260,8,45,1,45,1,45,1,45,1,45,1,46,
	4,46,267,8,46,11,46,12,46,268,1,46,1,46,0,0,47,1,1,3,2,5,3,7,4,9,5,11,6,
	13,7,15,8,17,9,19,10,21,11,23,12,25,13,27,14,29,15,31,16,33,17,35,18,37,
	19,39,20,41,21,43,22,45,23,47,24,49,25,51,26,53,27,55,28,57,29,59,30,61,
	31,63,32,65,33,67,34,69,35,71,36,73,37,75,38,77,39,79,40,81,41,83,42,85,
	43,87,44,89,45,91,46,93,47,1,0,8,2,0,10,10,13,13,2,0,95,95,97,122,1,0,65,
	90,1,0,97,122,1,0,48,57,1,0,39,39,1,0,34,34,3,0,9,10,13,13,32,32,282,0,
	1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,0,0,11,1,0,0,0,
	0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,0,0,21,1,0,0,0,0,23,1,
	0,0,0,0,25,1,0,0,0,0,27,1,0,0,0,0,29,1,0,0,0,0,31,1,0,0,0,0,33,1,0,0,0,
	0,35,1,0,0,0,0,37,1,0,0,0,0,39,1,0,0,0,0,41,1,0,0,0,0,43,1,0,0,0,0,45,1,
	0,0,0,0,47,1,0,0,0,0,49,1,0,0,0,0,51,1,0,0,0,0,53,1,0,0,0,0,55,1,0,0,0,
	0,57,1,0,0,0,0,59,1,0,0,0,0,61,1,0,0,0,0,63,1,0,0,0,0,65,1,0,0,0,0,67,1,
	0,0,0,0,69,1,0,0,0,0,71,1,0,0,0,0,73,1,0,0,0,0,75,1,0,0,0,0,77,1,0,0,0,
	0,79,1,0,0,0,0,81,1,0,0,0,0,83,1,0,0,0,0,85,1,0,0,0,0,87,1,0,0,0,0,89,1,
	0,0,0,0,91,1,0,0,0,0,93,1,0,0,0,1,95,1,0,0,0,3,99,1,0,0,0,5,101,1,0,0,0,
	7,103,1,0,0,0,9,105,1,0,0,0,11,107,1,0,0,0,13,109,1,0,0,0,15,112,1,0,0,
	0,17,114,1,0,0,0,19,116,1,0,0,0,21,119,1,0,0,0,23,121,1,0,0,0,25,123,1,
	0,0,0,27,125,1,0,0,0,29,128,1,0,0,0,31,131,1,0,0,0,33,133,1,0,0,0,35,135,
	1,0,0,0,37,137,1,0,0,0,39,140,1,0,0,0,41,143,1,0,0,0,43,146,1,0,0,0,45,
	149,1,0,0,0,47,152,1,0,0,0,49,155,1,0,0,0,51,158,1,0,0,0,53,161,1,0,0,0,
	55,164,1,0,0,0,57,167,1,0,0,0,59,170,1,0,0,0,61,173,1,0,0,0,63,178,1,0,
	0,0,65,180,1,0,0,0,67,182,1,0,0,0,69,185,1,0,0,0,71,187,1,0,0,0,73,189,
	1,0,0,0,75,194,1,0,0,0,77,196,1,0,0,0,79,208,1,0,0,0,81,213,1,0,0,0,83,
	224,1,0,0,0,85,228,1,0,0,0,87,237,1,0,0,0,89,249,1,0,0,0,91,259,1,0,0,0,
	93,266,1,0,0,0,95,96,5,108,0,0,96,97,5,101,0,0,97,98,5,116,0,0,98,2,1,0,
	0,0,99,100,5,58,0,0,100,4,1,0,0,0,101,102,5,61,0,0,102,6,1,0,0,0,103,104,
	5,60,0,0,104,8,1,0,0,0,105,106,5,44,0,0,106,10,1,0,0,0,107,108,5,62,0,0,
	108,12,1,0,0,0,109,110,5,70,0,0,110,111,5,110,0,0,111,14,1,0,0,0,112,113,
	5,40,0,0,113,16,1,0,0,0,114,115,5,41,0,0,115,18,1,0,0,0,116,117,5,45,0,
	0,117,118,5,62,0,0,118,20,1,0,0,0,119,120,5,33,0,0,120,22,1,0,0,0,121,122,
	5,42,0,0,122,24,1,0,0,0,123,124,5,47,0,0,124,26,1,0,0,0,125,126,5,42,0,
	0,126,127,5,46,0,0,127,28,1,0,0,0,128,129,5,47,0,0,129,130,5,46,0,0,130,
	30,1,0,0,0,131,132,5,37,0,0,132,32,1,0,0,0,133,134,5,43,0,0,134,34,1,0,
	0,0,135,136,5,45,0,0,136,36,1,0,0,0,137,138,5,43,0,0,138,139,5,46,0,0,139,
	38,1,0,0,0,140,141,5,45,0,0,141,142,5,46,0,0,142,40,1,0,0,0,143,144,5,43,
	0,0,144,145,5,43,0,0,145,42,1,0,0,0,146,147,5,58,0,0,147,148,5,58,0,0,148,
	44,1,0,0,0,149,150,5,61,0,0,150,151,5,61,0,0,151,46,1,0,0,0,152,153,5,33,
	0,0,153,154,5,61,0,0,154,48,1,0,0,0,155,156,5,60,0,0,156,157,5,61,0,0,157,
	50,1,0,0,0,158,159,5,62,0,0,159,160,5,61,0,0,160,52,1,0,0,0,161,162,5,124,
	0,0,162,163,5,124,0,0,163,54,1,0,0,0,164,165,5,38,0,0,165,166,5,38,0,0,
	166,56,1,0,0,0,167,168,5,102,0,0,168,169,5,110,0,0,169,58,1,0,0,0,170,171,
	5,105,0,0,171,172,5,102,0,0,172,60,1,0,0,0,173,174,5,101,0,0,174,175,5,
	108,0,0,175,176,5,115,0,0,176,177,5,101,0,0,177,62,1,0,0,0,178,179,5,91,
	0,0,179,64,1,0,0,0,180,181,5,93,0,0,181,66,1,0,0,0,182,183,5,124,0,0,183,
	184,5,62,0,0,184,68,1,0,0,0,185,186,5,123,0,0,186,70,1,0,0,0,187,188,5,
	125,0,0,188,72,1,0,0,0,189,190,5,108,0,0,190,191,5,101,0,0,191,192,5,116,
	0,0,192,193,5,35,0,0,193,74,1,0,0,0,194,195,5,59,0,0,195,76,1,0,0,0,196,
	197,5,47,0,0,197,198,5,47,0,0,198,202,1,0,0,0,199,201,8,0,0,0,200,199,1,
	0,0,0,201,204,1,0,0,0,202,200,1,0,0,0,202,203,1,0,0,0,203,205,1,0,0,0,204,
	202,1,0,0,0,205,206,6,38,0,0,206,78,1,0,0,0,207,209,7,1,0,0,208,207,1,0,
	0,0,209,210,1,0,0,0,210,208,1,0,0,0,210,211,1,0,0,0,211,80,1,0,0,0,212,
	214,7,2,0,0,213,212,1,0,0,0,214,215,1,0,0,0,215,213,1,0,0,0,215,216,1,0,
	0,0,216,220,1,0,0,0,217,219,7,3,0,0,218,217,1,0,0,0,219,222,1,0,0,0,220,
	218,1,0,0,0,220,221,1,0,0,0,221,82,1,0,0,0,222,220,1,0,0,0,223,225,7,4,
	0,0,224,223,1,0,0,0,225,226,1,0,0,0,226,224,1,0,0,0,226,227,1,0,0,0,227,
	84,1,0,0,0,228,232,5,39,0,0,229,231,8,5,0,0,230,229,1,0,0,0,231,234,1,0,
	0,0,232,230,1,0,0,0,232,233,1,0,0,0,233,235,1,0,0,0,234,232,1,0,0,0,235,
	236,5,39,0,0,236,86,1,0,0,0,237,241,5,34,0,0,238,240,8,6,0,0,239,238,1,
	0,0,0,240,243,1,0,0,0,241,239,1,0,0,0,241,242,1,0,0,0,242,244,1,0,0,0,243,
	241,1,0,0,0,244,245,5,34,0,0,245,88,1,0,0,0,246,248,7,4,0,0,247,246,1,0,
	0,0,248,251,1,0,0,0,249,247,1,0,0,0,249,250,1,0,0,0,250,252,1,0,0,0,251,
	249,1,0,0,0,252,254,5,46,0,0,253,255,7,4,0,0,254,253,1,0,0,0,255,256,1,
	0,0,0,256,254,1,0,0,0,256,257,1,0,0,0,257,90,1,0,0,0,258,260,5,13,0,0,259,
	258,1,0,0,0,259,260,1,0,0,0,260,261,1,0,0,0,261,262,5,10,0,0,262,263,1,
	0,0,0,263,264,6,45,1,0,264,92,1,0,0,0,265,267,7,7,0,0,266,265,1,0,0,0,267,
	268,1,0,0,0,268,266,1,0,0,0,268,269,1,0,0,0,269,270,1,0,0,0,270,271,6,46,
	1,0,271,94,1,0,0,0,12,0,202,210,215,220,226,232,241,249,256,259,268,2,0,
	1,0,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!KestrelLexer.__ATN) {
			KestrelLexer.__ATN = new ATNDeserializer().deserialize(KestrelLexer._serializedATN);
		}

		return KestrelLexer.__ATN;
	}


	static DecisionsToDFA = KestrelLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}