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
	public static readonly ID = 9;
	public static readonly INT = 10;
	public static readonly FLOAT = 11;
	public static readonly NEWLINE = 12;
	public static readonly WS = 13;
	public static readonly EOF = Token.EOF;

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	public static readonly literalNames: (string | null)[] = [ null, "'let'", 
                                                            "'='", "'*'", 
                                                            "'/'", "'+'", 
                                                            "'-'", "'('", 
                                                            "')'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, "ID", 
                                                             "INT", "FLOAT", 
                                                             "NEWLINE", 
                                                             "WS" ];
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "T__2", "T__3", "T__4", "T__5", "T__6", "T__7", "ID", 
		"INT", "FLOAT", "NEWLINE", "WS",
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

	public static readonly _serializedATN: number[] = [4,0,13,79,6,-1,2,0,7,
	0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,
	9,2,10,7,10,2,11,7,11,2,12,7,12,1,0,1,0,1,0,1,0,1,1,1,1,1,2,1,2,1,3,1,3,
	1,4,1,4,1,5,1,5,1,6,1,6,1,7,1,7,1,8,4,8,47,8,8,11,8,12,8,48,1,9,4,9,52,
	8,9,11,9,12,9,53,1,10,5,10,57,8,10,10,10,12,10,60,9,10,1,10,1,10,4,10,64,
	8,10,11,10,12,10,65,1,11,3,11,69,8,11,1,11,1,11,1,12,4,12,74,8,12,11,12,
	12,12,75,1,12,1,12,0,0,13,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,
	21,11,23,12,25,13,1,0,3,2,0,95,95,97,122,1,0,48,57,3,0,9,10,13,13,32,32,
	84,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,0,0,11,1,0,
	0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,0,0,21,1,0,0,0,0,
	23,1,0,0,0,0,25,1,0,0,0,1,27,1,0,0,0,3,31,1,0,0,0,5,33,1,0,0,0,7,35,1,0,
	0,0,9,37,1,0,0,0,11,39,1,0,0,0,13,41,1,0,0,0,15,43,1,0,0,0,17,46,1,0,0,
	0,19,51,1,0,0,0,21,58,1,0,0,0,23,68,1,0,0,0,25,73,1,0,0,0,27,28,5,108,0,
	0,28,29,5,101,0,0,29,30,5,116,0,0,30,2,1,0,0,0,31,32,5,61,0,0,32,4,1,0,
	0,0,33,34,5,42,0,0,34,6,1,0,0,0,35,36,5,47,0,0,36,8,1,0,0,0,37,38,5,43,
	0,0,38,10,1,0,0,0,39,40,5,45,0,0,40,12,1,0,0,0,41,42,5,40,0,0,42,14,1,0,
	0,0,43,44,5,41,0,0,44,16,1,0,0,0,45,47,7,0,0,0,46,45,1,0,0,0,47,48,1,0,
	0,0,48,46,1,0,0,0,48,49,1,0,0,0,49,18,1,0,0,0,50,52,7,1,0,0,51,50,1,0,0,
	0,52,53,1,0,0,0,53,51,1,0,0,0,53,54,1,0,0,0,54,20,1,0,0,0,55,57,7,1,0,0,
	56,55,1,0,0,0,57,60,1,0,0,0,58,56,1,0,0,0,58,59,1,0,0,0,59,61,1,0,0,0,60,
	58,1,0,0,0,61,63,5,46,0,0,62,64,7,1,0,0,63,62,1,0,0,0,64,65,1,0,0,0,65,
	63,1,0,0,0,65,66,1,0,0,0,66,22,1,0,0,0,67,69,5,13,0,0,68,67,1,0,0,0,68,
	69,1,0,0,0,69,70,1,0,0,0,70,71,5,10,0,0,71,24,1,0,0,0,72,74,7,2,0,0,73,
	72,1,0,0,0,74,75,1,0,0,0,75,73,1,0,0,0,75,76,1,0,0,0,76,77,1,0,0,0,77,78,
	6,12,0,0,78,26,1,0,0,0,7,0,48,53,58,65,68,75,1,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!KestrelLexer.__ATN) {
			KestrelLexer.__ATN = new ATNDeserializer().deserialize(KestrelLexer._serializedATN);
		}

		return KestrelLexer.__ATN;
	}


	static DecisionsToDFA = KestrelLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}