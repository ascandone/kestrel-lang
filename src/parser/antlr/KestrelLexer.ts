// @ts-nocheck
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
	public static readonly T__40 = 41;
	public static readonly T__41 = 42;
	public static readonly T__42 = 43;
	public static readonly T__43 = 44;
	public static readonly T__44 = 45;
	public static readonly T__45 = 46;
	public static readonly T__46 = 47;
	public static readonly T__47 = 48;
	public static readonly SLASH_4 = 49;
	public static readonly SLASH_3 = 50;
	public static readonly SLASH_2 = 51;
	public static readonly LineComment = 52;
	public static readonly EXPOSING_NESTED = 53;
	public static readonly INFIX_ID = 54;
	public static readonly ID = 55;
	public static readonly TYPE_ID = 56;
	public static readonly INT = 57;
	public static readonly CHAR = 58;
	public static readonly STRING = 59;
	public static readonly FLOAT = 60;
	public static readonly NEWLINE = 61;
	public static readonly WS = 62;
	public static readonly MODULEDOC_COMMENT_LINE = 63;
	public static readonly DOC_COMMENT_LINE = 64;
	public static readonly INFIX_CHAR = 65;
	public static readonly EOF = Token.EOF;

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	public static readonly literalNames: (string | null)[] = [ null, "'/'", 
                                                            "'import'", 
                                                            "'.'", "'{'", 
                                                            "','", "'}'", 
                                                            "'@inline'", 
                                                            "'pub'", "'let'", 
                                                            "':'", "'='", 
                                                            "'extern'", 
                                                            "'type'", "'struct'", 
                                                            "'<'", "'>'", 
                                                            "'where'", "'+'", 
                                                            "'Fn'", "'('", 
                                                            "')'", "'->'", 
                                                            "'!'", "'*'", 
                                                            "'*.'", "'/.'", 
                                                            "'%'", "'-'", 
                                                            "'+.'", "'-.'", 
                                                            "'++'", "'::'", 
                                                            "'=='", "'!='", 
                                                            "'<='", "'>='", 
                                                            "'||'", "'&&'", 
                                                            "'fn'", "'if'", 
                                                            "'else'", "'match'", 
                                                            "'['", "']'", 
                                                            "'|>'", "'=>'", 
                                                            "'let#'", "';'", 
                                                            "'////'", "'///'", 
                                                            "'//'" ];
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
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, "SLASH_4", 
                                                             "SLASH_3", 
                                                             "SLASH_2", 
                                                             "LineComment", 
                                                             "EXPOSING_NESTED", 
                                                             "INFIX_ID", 
                                                             "ID", "TYPE_ID", 
                                                             "INT", "CHAR", 
                                                             "STRING", "FLOAT", 
                                                             "NEWLINE", 
                                                             "WS", "MODULEDOC_COMMENT_LINE", 
                                                             "DOC_COMMENT_LINE", 
                                                             "INFIX_CHAR" ];
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "T__2", "T__3", "T__4", "T__5", "T__6", "T__7", "T__8", 
		"T__9", "T__10", "T__11", "T__12", "T__13", "T__14", "T__15", "T__16", 
		"T__17", "T__18", "T__19", "T__20", "T__21", "T__22", "T__23", "T__24", 
		"T__25", "T__26", "T__27", "T__28", "T__29", "T__30", "T__31", "T__32", 
		"T__33", "T__34", "T__35", "T__36", "T__37", "T__38", "T__39", "T__40", 
		"T__41", "T__42", "T__43", "T__44", "T__45", "T__46", "T__47", "SLASH_4", 
		"SLASH_3", "SLASH_2", "LineComment", "EXPOSING_NESTED", "INFIX_ID", "ID", 
		"TYPE_ID", "INT", "CHAR", "STRING", "DoubleStringCharacter", "FLOAT", 
		"NEWLINE", "WS", "MODULEDOC_COMMENT_LINE", "DOC_COMMENT_LINE", "INFIX_CHAR",
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

	public static readonly _serializedATN: number[] = [4,0,65,416,6,-1,2,0,
	7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,
	7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,
	16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,
	2,24,7,24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,
	31,7,31,2,32,7,32,2,33,7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,
	7,38,2,39,7,39,2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,
	45,2,46,7,46,2,47,7,47,2,48,7,48,2,49,7,49,2,50,7,50,2,51,7,51,2,52,7,52,
	2,53,7,53,2,54,7,54,2,55,7,55,2,56,7,56,2,57,7,57,2,58,7,58,2,59,7,59,2,
	60,7,60,2,61,7,61,2,62,7,62,2,63,7,63,2,64,7,64,2,65,7,65,1,0,1,0,1,1,1,
	1,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1,3,1,3,1,4,1,4,1,5,1,5,1,6,1,6,1,6,1,6,1,
	6,1,6,1,6,1,6,1,7,1,7,1,7,1,7,1,8,1,8,1,8,1,8,1,9,1,9,1,10,1,10,1,11,1,
	11,1,11,1,11,1,11,1,11,1,11,1,12,1,12,1,12,1,12,1,12,1,13,1,13,1,13,1,13,
	1,13,1,13,1,13,1,14,1,14,1,15,1,15,1,16,1,16,1,16,1,16,1,16,1,16,1,17,1,
	17,1,18,1,18,1,18,1,19,1,19,1,20,1,20,1,21,1,21,1,21,1,22,1,22,1,23,1,23,
	1,24,1,24,1,24,1,25,1,25,1,25,1,26,1,26,1,27,1,27,1,28,1,28,1,28,1,29,1,
	29,1,29,1,30,1,30,1,30,1,31,1,31,1,31,1,32,1,32,1,32,1,33,1,33,1,33,1,34,
	1,34,1,34,1,35,1,35,1,35,1,36,1,36,1,36,1,37,1,37,1,37,1,38,1,38,1,38,1,
	39,1,39,1,39,1,40,1,40,1,40,1,40,1,40,1,41,1,41,1,41,1,41,1,41,1,41,1,42,
	1,42,1,43,1,43,1,44,1,44,1,44,1,45,1,45,1,45,1,46,1,46,1,46,1,46,1,46,1,
	47,1,47,1,48,1,48,1,48,1,48,1,48,1,49,1,49,1,49,1,49,1,50,1,50,1,50,1,51,
	1,51,5,51,304,8,51,10,51,12,51,307,9,51,1,51,1,51,1,52,1,52,1,52,1,52,1,
	52,1,52,1,53,1,53,4,53,319,8,53,11,53,12,53,320,1,53,1,53,1,54,1,54,5,54,
	327,8,54,10,54,12,54,330,9,54,1,55,4,55,333,8,55,11,55,12,55,334,1,55,5,
	55,338,8,55,10,55,12,55,341,9,55,1,56,4,56,344,8,56,11,56,12,56,345,1,57,
	1,57,5,57,350,8,57,10,57,12,57,353,9,57,1,57,1,57,1,58,1,58,5,58,359,8,
	58,10,58,12,58,362,9,58,1,58,1,58,1,59,1,59,1,59,3,59,369,8,59,1,60,5,60,
	372,8,60,10,60,12,60,375,9,60,1,60,1,60,4,60,379,8,60,11,60,12,60,380,1,
	61,3,61,384,8,61,1,61,1,61,1,61,1,61,1,62,4,62,391,8,62,11,62,12,62,392,
	1,62,1,62,1,63,1,63,5,63,399,8,63,10,63,12,63,402,9,63,1,63,1,63,1,64,1,
	64,5,64,408,8,64,10,64,12,64,411,9,64,1,64,1,64,1,65,1,65,0,0,66,1,1,3,
	2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,11,23,12,25,13,27,14,29,15,31,
	16,33,17,35,18,37,19,39,20,41,21,43,22,45,23,47,24,49,25,51,26,53,27,55,
	28,57,29,59,30,61,31,63,32,65,33,67,34,69,35,71,36,73,37,75,38,77,39,79,
	40,81,41,83,42,85,43,87,44,89,45,91,46,93,47,95,48,97,49,99,50,101,51,103,
	52,105,53,107,54,109,55,111,56,113,57,115,58,117,59,119,0,121,60,123,61,
	125,62,127,63,129,64,131,65,1,0,11,2,0,10,10,13,13,2,0,95,95,97,122,3,0,
	48,57,95,95,97,122,1,0,65,90,3,0,48,57,65,90,97,122,1,0,48,57,1,0,39,39,
	1,0,34,34,3,0,9,10,13,13,32,32,1,0,10,10,8,0,33,33,37,38,42,43,45,47,58,
	58,60,62,94,94,124,124,429,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,
	0,0,0,9,1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,
	1,0,0,0,0,21,1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,0,27,1,0,0,0,0,29,1,0,0,
	0,0,31,1,0,0,0,0,33,1,0,0,0,0,35,1,0,0,0,0,37,1,0,0,0,0,39,1,0,0,0,0,41,
	1,0,0,0,0,43,1,0,0,0,0,45,1,0,0,0,0,47,1,0,0,0,0,49,1,0,0,0,0,51,1,0,0,
	0,0,53,1,0,0,0,0,55,1,0,0,0,0,57,1,0,0,0,0,59,1,0,0,0,0,61,1,0,0,0,0,63,
	1,0,0,0,0,65,1,0,0,0,0,67,1,0,0,0,0,69,1,0,0,0,0,71,1,0,0,0,0,73,1,0,0,
	0,0,75,1,0,0,0,0,77,1,0,0,0,0,79,1,0,0,0,0,81,1,0,0,0,0,83,1,0,0,0,0,85,
	1,0,0,0,0,87,1,0,0,0,0,89,1,0,0,0,0,91,1,0,0,0,0,93,1,0,0,0,0,95,1,0,0,
	0,0,97,1,0,0,0,0,99,1,0,0,0,0,101,1,0,0,0,0,103,1,0,0,0,0,105,1,0,0,0,0,
	107,1,0,0,0,0,109,1,0,0,0,0,111,1,0,0,0,0,113,1,0,0,0,0,115,1,0,0,0,0,117,
	1,0,0,0,0,121,1,0,0,0,0,123,1,0,0,0,0,125,1,0,0,0,0,127,1,0,0,0,0,129,1,
	0,0,0,0,131,1,0,0,0,1,133,1,0,0,0,3,135,1,0,0,0,5,142,1,0,0,0,7,144,1,0,
	0,0,9,146,1,0,0,0,11,148,1,0,0,0,13,150,1,0,0,0,15,158,1,0,0,0,17,162,1,
	0,0,0,19,166,1,0,0,0,21,168,1,0,0,0,23,170,1,0,0,0,25,177,1,0,0,0,27,182,
	1,0,0,0,29,189,1,0,0,0,31,191,1,0,0,0,33,193,1,0,0,0,35,199,1,0,0,0,37,
	201,1,0,0,0,39,204,1,0,0,0,41,206,1,0,0,0,43,208,1,0,0,0,45,211,1,0,0,0,
	47,213,1,0,0,0,49,215,1,0,0,0,51,218,1,0,0,0,53,221,1,0,0,0,55,223,1,0,
	0,0,57,225,1,0,0,0,59,228,1,0,0,0,61,231,1,0,0,0,63,234,1,0,0,0,65,237,
	1,0,0,0,67,240,1,0,0,0,69,243,1,0,0,0,71,246,1,0,0,0,73,249,1,0,0,0,75,
	252,1,0,0,0,77,255,1,0,0,0,79,258,1,0,0,0,81,261,1,0,0,0,83,266,1,0,0,0,
	85,272,1,0,0,0,87,274,1,0,0,0,89,276,1,0,0,0,91,279,1,0,0,0,93,282,1,0,
	0,0,95,287,1,0,0,0,97,289,1,0,0,0,99,294,1,0,0,0,101,298,1,0,0,0,103,301,
	1,0,0,0,105,310,1,0,0,0,107,316,1,0,0,0,109,324,1,0,0,0,111,332,1,0,0,0,
	113,343,1,0,0,0,115,347,1,0,0,0,117,356,1,0,0,0,119,368,1,0,0,0,121,373,
	1,0,0,0,123,383,1,0,0,0,125,390,1,0,0,0,127,396,1,0,0,0,129,405,1,0,0,0,
	131,414,1,0,0,0,133,134,5,47,0,0,134,2,1,0,0,0,135,136,5,105,0,0,136,137,
	5,109,0,0,137,138,5,112,0,0,138,139,5,111,0,0,139,140,5,114,0,0,140,141,
	5,116,0,0,141,4,1,0,0,0,142,143,5,46,0,0,143,6,1,0,0,0,144,145,5,123,0,
	0,145,8,1,0,0,0,146,147,5,44,0,0,147,10,1,0,0,0,148,149,5,125,0,0,149,12,
	1,0,0,0,150,151,5,64,0,0,151,152,5,105,0,0,152,153,5,110,0,0,153,154,5,
	108,0,0,154,155,5,105,0,0,155,156,5,110,0,0,156,157,5,101,0,0,157,14,1,
	0,0,0,158,159,5,112,0,0,159,160,5,117,0,0,160,161,5,98,0,0,161,16,1,0,0,
	0,162,163,5,108,0,0,163,164,5,101,0,0,164,165,5,116,0,0,165,18,1,0,0,0,
	166,167,5,58,0,0,167,20,1,0,0,0,168,169,5,61,0,0,169,22,1,0,0,0,170,171,
	5,101,0,0,171,172,5,120,0,0,172,173,5,116,0,0,173,174,5,101,0,0,174,175,
	5,114,0,0,175,176,5,110,0,0,176,24,1,0,0,0,177,178,5,116,0,0,178,179,5,
	121,0,0,179,180,5,112,0,0,180,181,5,101,0,0,181,26,1,0,0,0,182,183,5,115,
	0,0,183,184,5,116,0,0,184,185,5,114,0,0,185,186,5,117,0,0,186,187,5,99,
	0,0,187,188,5,116,0,0,188,28,1,0,0,0,189,190,5,60,0,0,190,30,1,0,0,0,191,
	192,5,62,0,0,192,32,1,0,0,0,193,194,5,119,0,0,194,195,5,104,0,0,195,196,
	5,101,0,0,196,197,5,114,0,0,197,198,5,101,0,0,198,34,1,0,0,0,199,200,5,
	43,0,0,200,36,1,0,0,0,201,202,5,70,0,0,202,203,5,110,0,0,203,38,1,0,0,0,
	204,205,5,40,0,0,205,40,1,0,0,0,206,207,5,41,0,0,207,42,1,0,0,0,208,209,
	5,45,0,0,209,210,5,62,0,0,210,44,1,0,0,0,211,212,5,33,0,0,212,46,1,0,0,
	0,213,214,5,42,0,0,214,48,1,0,0,0,215,216,5,42,0,0,216,217,5,46,0,0,217,
	50,1,0,0,0,218,219,5,47,0,0,219,220,5,46,0,0,220,52,1,0,0,0,221,222,5,37,
	0,0,222,54,1,0,0,0,223,224,5,45,0,0,224,56,1,0,0,0,225,226,5,43,0,0,226,
	227,5,46,0,0,227,58,1,0,0,0,228,229,5,45,0,0,229,230,5,46,0,0,230,60,1,
	0,0,0,231,232,5,43,0,0,232,233,5,43,0,0,233,62,1,0,0,0,234,235,5,58,0,0,
	235,236,5,58,0,0,236,64,1,0,0,0,237,238,5,61,0,0,238,239,5,61,0,0,239,66,
	1,0,0,0,240,241,5,33,0,0,241,242,5,61,0,0,242,68,1,0,0,0,243,244,5,60,0,
	0,244,245,5,61,0,0,245,70,1,0,0,0,246,247,5,62,0,0,247,248,5,61,0,0,248,
	72,1,0,0,0,249,250,5,124,0,0,250,251,5,124,0,0,251,74,1,0,0,0,252,253,5,
	38,0,0,253,254,5,38,0,0,254,76,1,0,0,0,255,256,5,102,0,0,256,257,5,110,
	0,0,257,78,1,0,0,0,258,259,5,105,0,0,259,260,5,102,0,0,260,80,1,0,0,0,261,
	262,5,101,0,0,262,263,5,108,0,0,263,264,5,115,0,0,264,265,5,101,0,0,265,
	82,1,0,0,0,266,267,5,109,0,0,267,268,5,97,0,0,268,269,5,116,0,0,269,270,
	5,99,0,0,270,271,5,104,0,0,271,84,1,0,0,0,272,273,5,91,0,0,273,86,1,0,0,
	0,274,275,5,93,0,0,275,88,1,0,0,0,276,277,5,124,0,0,277,278,5,62,0,0,278,
	90,1,0,0,0,279,280,5,61,0,0,280,281,5,62,0,0,281,92,1,0,0,0,282,283,5,108,
	0,0,283,284,5,101,0,0,284,285,5,116,0,0,285,286,5,35,0,0,286,94,1,0,0,0,
	287,288,5,59,0,0,288,96,1,0,0,0,289,290,5,47,0,0,290,291,5,47,0,0,291,292,
	5,47,0,0,292,293,5,47,0,0,293,98,1,0,0,0,294,295,5,47,0,0,295,296,5,47,
	0,0,296,297,5,47,0,0,297,100,1,0,0,0,298,299,5,47,0,0,299,300,5,47,0,0,
	300,102,1,0,0,0,301,305,3,101,50,0,302,304,8,0,0,0,303,302,1,0,0,0,304,
	307,1,0,0,0,305,303,1,0,0,0,305,306,1,0,0,0,306,308,1,0,0,0,307,305,1,0,
	0,0,308,309,6,51,0,0,309,104,1,0,0,0,310,311,5,40,0,0,311,312,5,46,0,0,
	312,313,5,46,0,0,313,314,1,0,0,0,314,315,5,41,0,0,315,106,1,0,0,0,316,318,
	5,40,0,0,317,319,3,131,65,0,318,317,1,0,0,0,319,320,1,0,0,0,320,318,1,0,
	0,0,320,321,1,0,0,0,321,322,1,0,0,0,322,323,5,41,0,0,323,108,1,0,0,0,324,
	328,7,1,0,0,325,327,7,2,0,0,326,325,1,0,0,0,327,330,1,0,0,0,328,326,1,0,
	0,0,328,329,1,0,0,0,329,110,1,0,0,0,330,328,1,0,0,0,331,333,7,3,0,0,332,
	331,1,0,0,0,333,334,1,0,0,0,334,332,1,0,0,0,334,335,1,0,0,0,335,339,1,0,
	0,0,336,338,7,4,0,0,337,336,1,0,0,0,338,341,1,0,0,0,339,337,1,0,0,0,339,
	340,1,0,0,0,340,112,1,0,0,0,341,339,1,0,0,0,342,344,7,5,0,0,343,342,1,0,
	0,0,344,345,1,0,0,0,345,343,1,0,0,0,345,346,1,0,0,0,346,114,1,0,0,0,347,
	351,5,39,0,0,348,350,8,6,0,0,349,348,1,0,0,0,350,353,1,0,0,0,351,349,1,
	0,0,0,351,352,1,0,0,0,352,354,1,0,0,0,353,351,1,0,0,0,354,355,5,39,0,0,
	355,116,1,0,0,0,356,360,5,34,0,0,357,359,3,119,59,0,358,357,1,0,0,0,359,
	362,1,0,0,0,360,358,1,0,0,0,360,361,1,0,0,0,361,363,1,0,0,0,362,360,1,0,
	0,0,363,364,5,34,0,0,364,118,1,0,0,0,365,369,8,7,0,0,366,367,5,92,0,0,367,
	369,9,0,0,0,368,365,1,0,0,0,368,366,1,0,0,0,369,120,1,0,0,0,370,372,7,5,
	0,0,371,370,1,0,0,0,372,375,1,0,0,0,373,371,1,0,0,0,373,374,1,0,0,0,374,
	376,1,0,0,0,375,373,1,0,0,0,376,378,5,46,0,0,377,379,7,5,0,0,378,377,1,
	0,0,0,379,380,1,0,0,0,380,378,1,0,0,0,380,381,1,0,0,0,381,122,1,0,0,0,382,
	384,5,13,0,0,383,382,1,0,0,0,383,384,1,0,0,0,384,385,1,0,0,0,385,386,5,
	10,0,0,386,387,1,0,0,0,387,388,6,61,1,0,388,124,1,0,0,0,389,391,7,8,0,0,
	390,389,1,0,0,0,391,392,1,0,0,0,392,390,1,0,0,0,392,393,1,0,0,0,393,394,
	1,0,0,0,394,395,6,62,1,0,395,126,1,0,0,0,396,400,3,97,48,0,397,399,8,9,
	0,0,398,397,1,0,0,0,399,402,1,0,0,0,400,398,1,0,0,0,400,401,1,0,0,0,401,
	403,1,0,0,0,402,400,1,0,0,0,403,404,3,123,61,0,404,128,1,0,0,0,405,409,
	3,99,49,0,406,408,8,9,0,0,407,406,1,0,0,0,408,411,1,0,0,0,409,407,1,0,0,
	0,409,410,1,0,0,0,410,412,1,0,0,0,411,409,1,0,0,0,412,413,3,123,61,0,413,
	130,1,0,0,0,414,415,7,10,0,0,415,132,1,0,0,0,16,0,305,320,328,334,339,345,
	351,360,368,373,380,383,392,400,409,2,0,1,0,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!KestrelLexer.__ATN) {
			KestrelLexer.__ATN = new ATNDeserializer().deserialize(KestrelLexer._serializedATN);
		}

		return KestrelLexer.__ATN;
	}


	static DecisionsToDFA = KestrelLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}
