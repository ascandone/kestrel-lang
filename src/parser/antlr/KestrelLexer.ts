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
	public static readonly ID = 10;
	public static readonly INT = 11;
	public static readonly CHAR = 12;
	public static readonly STRING = 13;
	public static readonly FLOAT = 14;
	public static readonly NEWLINE = 15;
	public static readonly WS = 16;
	public static readonly EOF = Token.EOF;

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	public static readonly literalNames: (string | null)[] = [ null, "'let'", 
                                                            "'='", "'*'", 
                                                            "'/'", "'+'", 
                                                            "'-'", "'+.'", 
                                                            "'('", "')'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, null, 
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
		"ID", "INT", "CHAR", "STRING", "FLOAT", "NEWLINE", "WS",
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

	public static readonly _serializedATN: number[] = [4,0,16,106,6,-1,2,0,
	7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,
	7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,1,0,1,0,
	1,0,1,0,1,1,1,1,1,2,1,2,1,3,1,3,1,4,1,4,1,5,1,5,1,6,1,6,1,6,1,7,1,7,1,8,
	1,8,1,9,4,9,56,8,9,11,9,12,9,57,1,10,4,10,61,8,10,11,10,12,10,62,1,11,1,
	11,5,11,67,8,11,10,11,12,11,70,9,11,1,11,1,11,1,12,1,12,5,12,76,8,12,10,
	12,12,12,79,9,12,1,12,1,12,1,13,5,13,84,8,13,10,13,12,13,87,9,13,1,13,1,
	13,4,13,91,8,13,11,13,12,13,92,1,14,3,14,96,8,14,1,14,1,14,1,15,4,15,101,
	8,15,11,15,12,15,102,1,15,1,15,0,0,16,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,
	8,17,9,19,10,21,11,23,12,25,13,27,14,29,15,31,16,1,0,5,2,0,95,95,97,122,
	1,0,48,57,1,0,39,39,1,0,34,34,3,0,9,10,13,13,32,32,113,0,1,1,0,0,0,0,3,
	1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,
	15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,0,0,21,1,0,0,0,0,23,1,0,0,0,0,25,1,0,
	0,0,0,27,1,0,0,0,0,29,1,0,0,0,0,31,1,0,0,0,1,33,1,0,0,0,3,37,1,0,0,0,5,
	39,1,0,0,0,7,41,1,0,0,0,9,43,1,0,0,0,11,45,1,0,0,0,13,47,1,0,0,0,15,50,
	1,0,0,0,17,52,1,0,0,0,19,55,1,0,0,0,21,60,1,0,0,0,23,64,1,0,0,0,25,73,1,
	0,0,0,27,85,1,0,0,0,29,95,1,0,0,0,31,100,1,0,0,0,33,34,5,108,0,0,34,35,
	5,101,0,0,35,36,5,116,0,0,36,2,1,0,0,0,37,38,5,61,0,0,38,4,1,0,0,0,39,40,
	5,42,0,0,40,6,1,0,0,0,41,42,5,47,0,0,42,8,1,0,0,0,43,44,5,43,0,0,44,10,
	1,0,0,0,45,46,5,45,0,0,46,12,1,0,0,0,47,48,5,43,0,0,48,49,5,46,0,0,49,14,
	1,0,0,0,50,51,5,40,0,0,51,16,1,0,0,0,52,53,5,41,0,0,53,18,1,0,0,0,54,56,
	7,0,0,0,55,54,1,0,0,0,56,57,1,0,0,0,57,55,1,0,0,0,57,58,1,0,0,0,58,20,1,
	0,0,0,59,61,7,1,0,0,60,59,1,0,0,0,61,62,1,0,0,0,62,60,1,0,0,0,62,63,1,0,
	0,0,63,22,1,0,0,0,64,68,5,39,0,0,65,67,8,2,0,0,66,65,1,0,0,0,67,70,1,0,
	0,0,68,66,1,0,0,0,68,69,1,0,0,0,69,71,1,0,0,0,70,68,1,0,0,0,71,72,5,39,
	0,0,72,24,1,0,0,0,73,77,5,34,0,0,74,76,8,3,0,0,75,74,1,0,0,0,76,79,1,0,
	0,0,77,75,1,0,0,0,77,78,1,0,0,0,78,80,1,0,0,0,79,77,1,0,0,0,80,81,5,34,
	0,0,81,26,1,0,0,0,82,84,7,1,0,0,83,82,1,0,0,0,84,87,1,0,0,0,85,83,1,0,0,
	0,85,86,1,0,0,0,86,88,1,0,0,0,87,85,1,0,0,0,88,90,5,46,0,0,89,91,7,1,0,
	0,90,89,1,0,0,0,91,92,1,0,0,0,92,90,1,0,0,0,92,93,1,0,0,0,93,28,1,0,0,0,
	94,96,5,13,0,0,95,94,1,0,0,0,95,96,1,0,0,0,96,97,1,0,0,0,97,98,5,10,0,0,
	98,30,1,0,0,0,99,101,7,4,0,0,100,99,1,0,0,0,101,102,1,0,0,0,102,100,1,0,
	0,0,102,103,1,0,0,0,103,104,1,0,0,0,104,105,6,15,0,0,105,32,1,0,0,0,9,0,
	57,62,68,77,85,92,95,102,1,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!KestrelLexer.__ATN) {
			KestrelLexer.__ATN = new ATNDeserializer().deserialize(KestrelLexer._serializedATN);
		}

		return KestrelLexer.__ATN;
	}


	static DecisionsToDFA = KestrelLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}