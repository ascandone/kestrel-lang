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
	public static readonly CHAR = 11;
	public static readonly STRING = 12;
	public static readonly FLOAT = 13;
	public static readonly NEWLINE = 14;
	public static readonly WS = 15;
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
                                                             "INT", "CHAR", 
                                                             "STRING", "FLOAT", 
                                                             "NEWLINE", 
                                                             "WS" ];
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "T__2", "T__3", "T__4", "T__5", "T__6", "T__7", "ID", 
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

	public static readonly _serializedATN: number[] = [4,0,15,101,6,-1,2,0,
	7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,
	7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,1,0,1,0,1,0,1,0,1,
	1,1,1,1,2,1,2,1,3,1,3,1,4,1,4,1,5,1,5,1,6,1,6,1,7,1,7,1,8,4,8,51,8,8,11,
	8,12,8,52,1,9,4,9,56,8,9,11,9,12,9,57,1,10,1,10,5,10,62,8,10,10,10,12,10,
	65,9,10,1,10,1,10,1,11,1,11,5,11,71,8,11,10,11,12,11,74,9,11,1,11,1,11,
	1,12,5,12,79,8,12,10,12,12,12,82,9,12,1,12,1,12,4,12,86,8,12,11,12,12,12,
	87,1,13,3,13,91,8,13,1,13,1,13,1,14,4,14,96,8,14,11,14,12,14,97,1,14,1,
	14,0,0,15,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,11,23,12,25,
	13,27,14,29,15,1,0,5,2,0,95,95,97,122,1,0,48,57,1,0,39,39,1,0,34,34,3,0,
	9,10,13,13,32,32,108,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,
	9,1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,
	0,0,0,21,1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,0,27,1,0,0,0,0,29,1,0,0,0,1,
	31,1,0,0,0,3,35,1,0,0,0,5,37,1,0,0,0,7,39,1,0,0,0,9,41,1,0,0,0,11,43,1,
	0,0,0,13,45,1,0,0,0,15,47,1,0,0,0,17,50,1,0,0,0,19,55,1,0,0,0,21,59,1,0,
	0,0,23,68,1,0,0,0,25,80,1,0,0,0,27,90,1,0,0,0,29,95,1,0,0,0,31,32,5,108,
	0,0,32,33,5,101,0,0,33,34,5,116,0,0,34,2,1,0,0,0,35,36,5,61,0,0,36,4,1,
	0,0,0,37,38,5,42,0,0,38,6,1,0,0,0,39,40,5,47,0,0,40,8,1,0,0,0,41,42,5,43,
	0,0,42,10,1,0,0,0,43,44,5,45,0,0,44,12,1,0,0,0,45,46,5,40,0,0,46,14,1,0,
	0,0,47,48,5,41,0,0,48,16,1,0,0,0,49,51,7,0,0,0,50,49,1,0,0,0,51,52,1,0,
	0,0,52,50,1,0,0,0,52,53,1,0,0,0,53,18,1,0,0,0,54,56,7,1,0,0,55,54,1,0,0,
	0,56,57,1,0,0,0,57,55,1,0,0,0,57,58,1,0,0,0,58,20,1,0,0,0,59,63,5,39,0,
	0,60,62,8,2,0,0,61,60,1,0,0,0,62,65,1,0,0,0,63,61,1,0,0,0,63,64,1,0,0,0,
	64,66,1,0,0,0,65,63,1,0,0,0,66,67,5,39,0,0,67,22,1,0,0,0,68,72,5,34,0,0,
	69,71,8,3,0,0,70,69,1,0,0,0,71,74,1,0,0,0,72,70,1,0,0,0,72,73,1,0,0,0,73,
	75,1,0,0,0,74,72,1,0,0,0,75,76,5,34,0,0,76,24,1,0,0,0,77,79,7,1,0,0,78,
	77,1,0,0,0,79,82,1,0,0,0,80,78,1,0,0,0,80,81,1,0,0,0,81,83,1,0,0,0,82,80,
	1,0,0,0,83,85,5,46,0,0,84,86,7,1,0,0,85,84,1,0,0,0,86,87,1,0,0,0,87,85,
	1,0,0,0,87,88,1,0,0,0,88,26,1,0,0,0,89,91,5,13,0,0,90,89,1,0,0,0,90,91,
	1,0,0,0,91,92,1,0,0,0,92,93,5,10,0,0,93,28,1,0,0,0,94,96,7,4,0,0,95,94,
	1,0,0,0,96,97,1,0,0,0,97,95,1,0,0,0,97,98,1,0,0,0,98,99,1,0,0,0,99,100,
	6,14,0,0,100,30,1,0,0,0,9,0,52,57,63,72,80,87,90,97,1,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!KestrelLexer.__ATN) {
			KestrelLexer.__ATN = new ATNDeserializer().deserialize(KestrelLexer._serializedATN);
		}

		return KestrelLexer.__ATN;
	}


	static DecisionsToDFA = KestrelLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}