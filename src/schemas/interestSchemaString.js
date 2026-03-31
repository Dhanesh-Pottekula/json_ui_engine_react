const interestSchemaObject = {
  state: {
    principal: 100000,
    annualRate: 8,
    years: 5,
    compoundFrequency: 4,
  },
  derived: {
    rateDecimal: "annualRate / 100",
    simpleInterest: "principal * rateDecimal * years",
    simpleTotal: "principal + simpleInterest",
    compoundTotal: "principal * pow(1 + rateDecimal / compoundFrequency, compoundFrequency * years)",
    compoundInterest: "compoundTotal - principal",
    difference: "compoundTotal - simpleTotal",
    effectiveYearlyGain: "compoundInterest / years",
  },
  actions: {
    resetCalculator: [
      {
        type: "set",
        values: {
          principal: 100000,
          annualRate: 8,
          years: 5,
          compoundFrequency: 4,
        },
        clearErrors: true,
      },
    ],
    validateInputs: [
      {
        type: "validate",
        rules: [
          {
            field: "principal",
            required: true,
            message: "Principal is required.",
          },
          {
            field: "principal",
            test: "value > 0",
            message: "Principal must be greater than 0.",
          },
          {
            field: "annualRate",
            required: true,
            message: "Interest rate is required.",
          },
          {
            field: "annualRate",
            test: "value >= 0",
            message: "Interest rate cannot be negative.",
          },
          {
            field: "years",
            required: true,
            message: "Years is required.",
          },
          {
            field: "years",
            test: "value > 0",
            message: "Years must be greater than 0.",
          },
          {
            field: "compoundFrequency",
            required: true,
            message: "Compounding frequency is required.",
          },
          {
            field: "compoundFrequency",
            test: "value > 0",
            message: "Compounding frequency must be greater than 0.",
          },
        ],
      },
    ],
    showSummary: [
      {
        type: "run",
        action: "validateInputs",
      },
      {
        type: "condition",
        test: "!hasErrors(runtime.errors)",
        then: [
          {
            type: "alert",
            message: "Simple total: {{formatCurrency(simpleTotal)}} | Compound total: {{formatCurrency(compoundTotal)}}",
          },
        ],
      },
    ],
  },
  ui: {
    type: "Container",
    props: {
      variant: "page",
      className: "min-h-screen bg-slate-950 text-white",
    },
    children: [
      {
        type: "Container",
        props: {
          className: "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8",
        },
        children: [
          {
            type: "Container",
            props: {
              className:
                "rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 p-6 shadow-2xl sm:p-8 lg:p-10",
            },
            children: [
              {
                type: "Text",
                props: {
                  tone: "eyebrow",
                  content: "Interest tracker",
                  className: "text-emerald-300 tracking-[0.2em] uppercase",
                },
              },
              {
                type: "Text",
                props: {
                  tone: "display",
                  content: "Simple and compound interest comparison",
                  className:
                    "mt-3 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl",
                },
              },
              {
                type: "Text",
                props: {
                  tone: "lead",
                  content:
                    "Adjust the amount, rate, duration, and compounding frequency to see how flat growth compares with compounding returns.",
                  className: "mt-4 max-w-2xl text-base text-slate-300 sm:text-lg",
                },
              },
              {
                type: "Container",
                props: {
                  variant: "actions",
                  className: "mt-6 flex flex-col gap-3 sm:flex-row",
                },
                children: [
                  {
                    type: "Button",
                    props: {
                      label: "Reset values",
                      variant: "secondary",
                      onClick: {
                        action: "resetCalculator",
                      },
                      className:
                        "rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:bg-white/10",
                    },
                  },
                  {
                    type: "Button",
                    props: {
                      label: "Quick summary",
                      variant: "primary",
                      onClick: {
                        action: "showSummary",
                      },
                      className:
                        "rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400",
                    },
                  },
                ],
              },
            ],
          },
          {
            type: "Container",
            props: {
              className: "mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5",
            },
            children: [
              {
                type: "Card",
                props: {
                  title: "Calculator inputs",
                  subtitle: "Update the assumptions and the tracker recalculates instantly.",
                  className:
                    "lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl backdrop-blur sm:p-6",
                },
                children: [
                  {
                    type: "Container",
                    props: {
                      className: "grid grid-cols-1 gap-5",
                    },
                    children: [
                      {
                        type: "NumberInput",
                        props: {
                          label: "Principal amount",
                          value: {
                            bind: "principal",
                          },
                          min: 0,
                          step: 1000,
                          prefix: "₹",
                          hint: "Starting amount for the comparison",
                          error: "{{runtime.errors.principal}}",
                          className: "w-full rounded-2xl border border-white/10 bg-slate-950/80",
                        },
                      },
                      {
                        type: "Slider",
                        props: {
                          label: "Annual interest rate",
                          value: {
                            bind: "annualRate",
                          },
                          min: 0,
                          max: 30,
                          step: 0.1,
                          suffix: "%",
                          hint: "Yearly rate used in both models",
                          error: "{{runtime.errors.annualRate}}",
                          className: "w-full rounded-2xl border border-white/10 bg-slate-950/80",
                        },
                      },
                      {
                        type: "Slider",
                        props: {
                          label: "Time period",
                          value: {
                            bind: "years",
                          },
                          min: 1,
                          max: 30,
                          step: 1,
                          suffix: " years",
                          hint: "Longer timelines widen the compounding gap",
                          error: "{{runtime.errors.years}}",
                          className: "w-full rounded-2xl border border-white/10 bg-slate-950/80",
                        },
                      },
                      {
                        type: "Select",
                        props: {
                          label: "Compounding frequency",
                          value: {
                            bind: "compoundFrequency",
                          },
                          options: [
                            { label: "Yearly", value: 1 },
                            { label: "Half-yearly", value: 2 },
                            { label: "Quarterly", value: 4 },
                            { label: "Monthly", value: 12 },
                            { label: "Daily", value: 365 },
                          ],
                          hint: "How often interest is added back to the base",
                          error: "{{runtime.errors.compoundFrequency}}",
                          className: "w-full rounded-2xl border border-white/10 bg-slate-950/80",
                        },
                      },
                    ],
                  },
                ],
              },
              {
                type: "Card",
                props: {
                  tone: "hero",
                  title: "Live comparison",
                  subtitle: "Simple interest grows linearly. Compound interest accelerates over time.",
                  className:
                    "lg:col-span-3 rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-slate-900/90 to-slate-900 p-5 shadow-2xl sm:p-6",
                },
                children: [
                  {
                    type: "StatGrid",
                    props: {
                      className: "mt-2",
                      items: [
                        { label: "Simple interest earned", value: "{{formatCurrency(simpleInterest)}}" },
                        { label: "Simple maturity value", value: "{{formatCurrency(simpleTotal)}}" },
                        { label: "Compound interest earned", value: "{{formatCurrency(compoundInterest)}}" },
                        { label: "Compound maturity value", value: "{{formatCurrency(compoundTotal)}}" },
                        { label: "Extra earned from compounding", value: "{{formatCurrency(difference)}}" },
                        { label: "Average compound gain per year", value: "{{formatCurrency(effectiveYearlyGain)}}" },
                      ],
                    },
                  },
                  {
                    type: "Container",
                    props: {
                      className: "mt-6 grid grid-cols-1 gap-4 md:grid-cols-2",
                    },
                    children: [
                      {
                        type: "Card",
                        props: {
                          className: "rounded-2xl border border-white/10 bg-slate-950/70 p-5",
                        },
                        children: [
                          {
                            type: "Text",
                            props: {
                              tone: "caption",
                              content: "Current setup",
                              className: "text-slate-400",
                            },
                          },
                          {
                            type: "Text",
                            props: {
                              tone: "metric",
                              content: "{{formatCurrency(principal)}}",
                              className: "mt-2 text-3xl font-semibold text-white",
                            },
                          },
                          {
                            type: "Text",
                            props: {
                              content: "At {{annualRate}}% for {{years}} years with {{compoundFrequency}} compounding cycles per year.",
                              className: "mt-2 text-sm leading-6 text-slate-300",
                            },
                          },
                        ],
                      },
                      {
                        type: "Card",
                        props: {
                          className: "rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5",
                        },
                        children: [
                          {
                            type: "Text",
                            props: {
                              tone: "caption",
                              content: "Compounding advantage",
                              className: "text-emerald-200",
                            },
                          },
                          {
                            type: "Text",
                            props: {
                              tone: "metric",
                              content: "{{formatCurrency(difference)}}",
                              className: "mt-2 text-3xl font-semibold text-white",
                            },
                          },
                          {
                            type: "Text",
                            props: {
                              tone: "success",
                              content: "This is the additional amount earned above simple interest.",
                              className: "mt-2 text-sm text-emerald-100",
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "Container",
            props: {
              className: "mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2",
            },
            children: [
              {
                type: "Card",
                props: {
                  title: "Growth by year",
                  subtitle: "A quick visual comparison for the first five years.",
                  className: "rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl sm:p-6",
                },
                children: [
                  {
                    type: "BarChart",
                    props: {
                      labelKey: "label",
                      maxBars: 5,
                      className: "mt-4",
                      bars: [
                        {
                          key: "simple",
                          label: "Simple",
                          className: "fill-sky-500",
                        },
                        {
                          key: "compound",
                          label: "Compound",
                          className: "fill-emerald-500",
                        },
                      ],
                      data: [
                        {
                          label: "Year 1",
                          simple: {
                            expr: "principal + principal * rateDecimal * min(1, years)",
                          },
                          compound: {
                            expr: "principal * pow(1 + rateDecimal / compoundFrequency, compoundFrequency * min(1, years))",
                          },
                        },
                        {
                          label: "Year 2",
                          simple: {
                            expr: "principal + principal * rateDecimal * min(2, years)",
                          },
                          compound: {
                            expr: "principal * pow(1 + rateDecimal / compoundFrequency, compoundFrequency * min(2, years))",
                          },
                        },
                        {
                          label: "Year 3",
                          simple: {
                            expr: "principal + principal * rateDecimal * min(3, years)",
                          },
                          compound: {
                            expr: "principal * pow(1 + rateDecimal / compoundFrequency, compoundFrequency * min(3, years))",
                          },
                        },
                        {
                          label: "Year 4",
                          simple: {
                            expr: "principal + principal * rateDecimal * min(4, years)",
                          },
                          compound: {
                            expr: "principal * pow(1 + rateDecimal / compoundFrequency, compoundFrequency * min(4, years))",
                          },
                        },
                        {
                          label: "Year 5",
                          simple: {
                            expr: "principal + principal * rateDecimal * min(5, years)",
                          },
                          compound: {
                            expr: "principal * pow(1 + rateDecimal / compoundFrequency, compoundFrequency * min(5, years))",
                          },
                        },
                      ],
                    },
                  },
                ],
              },
              {
                type: "Card",
                props: {
                  title: "How to read the tracker",
                  subtitle: "Use this section to explain the comparison clearly.",
                  className: "rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl sm:p-6",
                },
                children: [
                  {
                    type: "Container",
                    props: {
                      className: "grid grid-cols-1 gap-4",
                    },
                    children: [
                      {
                        type: "Card",
                        props: {
                          className: "rounded-2xl border border-white/10 bg-slate-950/70 p-4",
                        },
                        children: [
                          {
                            type: "Text",
                            props: {
                              tone: "caption",
                              content: "Simple interest",
                              className: "text-sky-300",
                            },
                          },
                          {
                            type: "Text",
                            props: {
                              content: "Interest is calculated only on the original principal, so each year adds the same fixed amount.",
                              className: "mt-2 text-sm leading-6 text-slate-300",
                            },
                          },
                        ],
                      },
                      {
                        type: "Card",
                        props: {
                          className: "rounded-2xl border border-white/10 bg-slate-950/70 p-4",
                        },
                        children: [
                          {
                            type: "Text",
                            props: {
                              tone: "caption",
                              content: "Compound interest",
                              className: "text-emerald-300",
                            },
                          },
                          {
                            type: "Text",
                            props: {
                              content: "Interest is added back into the balance, so future interest earns on both principal and past interest.",
                              className: "mt-2 text-sm leading-6 text-slate-300",
                            },
                          },
                        ],
                      },
                      {
                        type: "Card",
                        props: {
                          className: "rounded-2xl border border-white/10 bg-slate-950/70 p-4",
                        },
                        children: [
                          {
                            type: "Text",
                            props: {
                              tone: "caption",
                              content: "Best use case",
                              className: "text-amber-300",
                            },
                          },
                          {
                            type: "Text",
                            props: {
                              content: "Use this for savings plans, fixed deposits, lending explainers, and fast financial comparisons.",
                              className: "mt-2 text-sm leading-6 text-slate-300",
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "Container",
            props: {
              className: "mt-8 rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-center shadow-xl sm:p-8",
            },
            children: [
              {
                type: "Text",
                props: {
                  tone: "display",
                  content: "The longer the horizon, the wider the compounding gap.",
                  className: "text-2xl font-semibold text-white sm:text-3xl",
                },
              },
              {
                type: "Text",
                props: {
                  tone: "lead",
                  content:
                    "Current projection: compound returns are ahead by {{formatCurrency(difference)}} on a base amount of {{formatCurrency(principal)}}.",
                  className: "mx-auto mt-3 max-w-3xl text-slate-300",
                },
              },
              {
                type: "Container",
                props: {
                  variant: "actions",
                  className: "mt-6 flex justify-center",
                },
                children: [
                  {
                    type: "Button",
                    props: {
                      label: "Review live totals",
                      variant: "primary",
                      onClick: {
                        action: "showSummary",
                      },
                      className: "rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

export const interestSchemaString = JSON.stringify(interestSchemaObject);

export const interestSchemaFromString = JSON.parse(interestSchemaString);

export default interestSchemaFromString;
