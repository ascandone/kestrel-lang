export type ConstLiteral =
  | { type: "int"; value: number }
  | { type: "float"; value: number }
  | { type: "string"; value: string };

export type Expr<Meta = {}> = Meta &
  (
    | {
        type: "constant";
        value: ConstLiteral;
      }
    | {
        type: "identifier";
        name: string;
      }
    | {
        type: "fn";
        param: { name: string } & Meta;
        body: Expr<Meta>;
      }
    | {
        type: "application";
        caller: Expr<Meta>;
        arg: Expr<Meta>;
      }
    | {
        type: "let";
        binding: string;
        definition: Expr<Meta>;
        body: Expr<Meta>;
      }
    | {
        type: "if";
        condition: Expr<Meta>;
        then: Expr<Meta>;
        else: Expr<Meta>;
      }
  );

export type Statement<Meta> = {
  type: "let";
  binding: string;
  value: Expr<Meta>;
};

export type Program<Meta> = {
  statements: Statement<Meta>[];
};
