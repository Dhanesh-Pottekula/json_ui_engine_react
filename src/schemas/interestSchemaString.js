const interestSchemaObject = {
  state: {
    selectedPreset: "earth",
    customGravity: 9.81,
    dropHeight: 8,
    bounce: 0.55,
    play: true,
    resetKey: 0,
    planetPresets: [
      { label: "Moon", value: "moon" },
      { label: "Mars", value: "mars" },
      { label: "Earth", value: "earth" },
      { label: "Jupiter", value: "jupiter" },
      { label: "Custom", value: "custom" },
    ],
    objects: [
      {
        label: "Rubber ball",
        className: "bg-sky-400",
        x: 14,
        size: 50,
        bounceMultiplier: 1.2,
      },
      {
        label: "Metal ball",
        className: "bg-slate-400",
        x: 42,
        size: 46,
        bounceMultiplier: 0.7,
      },
      {
        label: "Tennis ball",
        className: "bg-lime-400",
        x: 70,
        size: 44,
        bounceMultiplier: 1.05,
      },
    ],
    planetFacts: [
      { planet: "Moon", gravity: "1.62 m/s²", feel: "Very floaty" },
      { planet: "Mars", gravity: "3.71 m/s²", feel: "Noticeably lighter" },
      { planet: "Earth", gravity: "9.81 m/s²", feel: "Familiar baseline" },
      { planet: "Jupiter", gravity: "24.79 m/s²", feel: "Heavy and fast" },
    ],
    learningCards: [
      {
        title: "Same law, different worlds",
        description:
          "Gravity changes acceleration, not the rule itself. That is why the same scene can feel completely different from one planet to another.",
      },
      {
        title: "Realtime feedback",
        description:
          "Changing gravity immediately updates the simulation, fall time, and impact speed so the page feels interactive instead of static.",
      },
      {
        title: "Made for experimentation",
        description:
          "Use presets for quick comparisons or enter a custom gravity value to imagine motion on your own fictional planet.",
      },
    ],
    faq: [
      {
        title: "Why do all objects fall together here?",
        description:
          "This demo focuses on gravity strength. Without air resistance, mass does not change the rate of free-fall acceleration.",
      },
      {
        title: "What changes when gravity increases?",
        description:
          "The fall happens faster, the time to impact drops, and the final speed rises.",
      },
      {
        title: "What does bounce control?",
        description:
          "Bounce changes how much energy remains after hitting the floor, making rebounds lower or stronger.",
      },
    ],
  },
  derived: {
    activeGravity: "selectedPreset == 'custom' ? customGravity : selectedPreset == 'moon' ? 1.62 : selectedPreset == 'mars' ? 3.71 : selectedPreset == 'jupiter' ? 24.79 : 9.81",
    fallTime: "sqrt((2 * dropHeight) / max(activeGravity, 0.1))",
    impactSpeed: "sqrt(2 * activeGravity * dropHeight)",
    gravityLabel: "round(activeGravity * 100) / 100",
    strengthLevel: "activeGravity < 3 ? 'Low gravity' : activeGravity < 12 ? 'Moderate gravity' : 'High gravity'",
    gravityPercentOfEarth: "round((activeGravity / 9.81) * 100)",
  },
  actions: {
    applyCurrentSettings: [
      {
        type: "condition",
        test: "selectedPreset == 'custom'",
        then: [
          {
            type: "validate",
            rules: [
              {
                field: "customGravity",
                required: true,
                message: "Custom gravity is required",
              },
              {
                field: "customGravity",
                test: "value > 0",
                message: "Gravity must be greater than 0",
              },
            ],
          },
          {
            type: "condition",
            test: "!hasErrors(runtime.errors)",
            then: [
              {
                type: "set",
                values: {
                  resetKey: { expr: "resetKey + 1" },
                  play: true,
                },
                clearErrors: true,
              },
            ],
          },
        ],
        else: [
          {
            type: "set",
            values: {
              resetKey: { expr: "resetKey + 1" },
              play: true,
            },
            clearErrors: true,
          },
        ],
      },
    ],
    togglePlay: [
      {
        type: "set",
        values: {
          play: { expr: "!play" },
        },
      },
    ],
    resetSimulation: [
      {
        type: "set",
        values: {
          selectedPreset: "earth",
          customGravity: 9.81,
          dropHeight: 8,
          bounce: 0.55,
          play: true,
          resetKey: 0,
        },
        clearErrors: true,
      },
    ],
  },
  ui: {
    type: "Div",
    props: {
      className: "min-h-screen bg-slate-950 text-slate-50",
    },
    children: [
      {
        type: "Section",
        props: {
          className: "border-b border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950",
        },
        children: [
          {
            type: "Div",
            props: {
              className: "mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20",
            },
            children: [
              {
                type: "Div",
                props: {
                  className: "space-y-6",
                },
                children: [
                  {
                    type: "Badge",
                    props: {
                      label: "Physics Playground",
                      variant: "secondary",
                      className: "w-fit border border-sky-400/30 bg-sky-400/10 text-sky-200",
                    },
                  },
                  {
                    type: "H1",
                    props: {
                      content: "Drop objects under different gravity values and watch them bounce",
                      className: "max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl",
                    },
                  },
                  {
                    type: "P",
                    props: {
                      content:
                        "Explore the Moon, Mars, Earth, Jupiter, or your own custom gravity. Change the controls and replay the scene instantly.",
                      className: "max-w-2xl text-base leading-7 text-slate-300 sm:text-lg",
                    },
                  },
                  {
                    type: "Div",
                    props: {
                      className: "flex flex-wrap gap-3",
                    },
                    children: [
                      {
                        type: "Badge",
                        props: {
                          label: "Live simulation",
                          variant: "outline",
                          className: "border-white/15 text-slate-200",
                        },
                      },
                      {
                        type: "Badge",
                        props: {
                          label: "Reusable schema blocks",
                          variant: "outline",
                          className: "border-white/15 text-slate-200",
                        },
                      },
                      {
                        type: "Badge",
                        props: {
                          label: "Custom gravity",
                          variant: "outline",
                          className: "border-white/15 text-slate-200",
                        },
                      },
                    ],
                  },
                ],
              },
              {
                type: "SectionCard",
                props: {
                  title: "Quick stats",
                  description: "Current simulation values update as you change gravity.",
                  className: "border-white/10 bg-white/5 text-white backdrop-blur",
                },
                children: [
                  {
                    type: "Div",
                    props: {
                      className: "grid gap-4 sm:grid-cols-3",
                    },
                    children: [
                      {
                        type: "StatCard",
                        props: {
                          label: "Gravity",
                          value: "{{gravityLabel}} m/s²",
                          className: "border-white/10 bg-slate-900/60 text-white",
                        },
                      },
                      {
                        type: "StatCard",
                        props: {
                          label: "Fall time",
                          value: "{{round(fallTime * 100) / 100}} s",
                          className: "border-white/10 bg-slate-900/60 text-white",
                        },
                      },
                      {
                        type: "StatCard",
                        props: {
                          label: "Impact speed",
                          value: "{{round(impactSpeed * 100) / 100}} m/s",
                          className: "border-white/10 bg-slate-900/60 text-white",
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
        type: "Section",
        props: {
          className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16",
        },
        children: [
          {
            type: "Div",
            props: {
              className: "grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]",
            },
            children: [
              {
                type: "SectionCard",
                props: {
                  title: "Controls",
                  description: "Choose a planet, tweak gravity, and restart the drop instantly.",
                  className: "border-white/10 bg-slate-900/70 text-white",
                },
                children: [
                  {
                    type: "Div",
                    props: {
                      className: "space-y-6",
                    },
                    children: [
                      {
                        type: "Select",
                        props: {
                          label: "Gravity preset",
                          value: {
                            bind: "selectedPreset",
                          },
                          options: {
                            expr: "planetPresets",
                          },
                          className: "w-full",
                        },
                      },
                      {
                        type: "Button",
                        props: {
                          label: "Apply current setting",
                          onClick: {
                            action: "applyCurrentSettings",
                          },
                          variant: "primary",
                          className: "w-full",
                        },
                      },
                      {
                        type: "Input",
                        props: {
                          label: "Custom gravity (m/s²)",
                          type: "number",
                          value: {
                            bind: "customGravity",
                            transform: "+input",
                          },
                          min: 0.1,
                          step: 0.01,
                          hint: "Use this when the preset is set to Custom",
                          error: {
                            expr: "runtime.errors.customGravity",
                          },
                          className: "w-full",
                        },
                        visibleWhen: "selectedPreset == 'custom'",
                      },
                      {
                        type: "Button",
                        props: {
                          label: "Use custom gravity",
                          onClick: {
                            action: "applyCurrentSettings",
                          },
                          variant: "secondary",
                          className: "w-full",
                        },
                        visibleWhen: "selectedPreset == 'custom'",
                      },
                      {
                        type: "Separator",
                        props: {
                          orientation: "horizontal",
                          className: "bg-white/10",
                        },
                      },
                      {
                        type: "Slider",
                        props: {
                          label: "Drop height",
                          value: {
                            bind: "dropHeight",
                          },
                          min: 2,
                          max: 12,
                          step: 0.5,
                          suffix: "m",
                          hint: "Higher drop height increases fall time and impact speed.",
                          className: "w-full",
                        },
                      },
                      {
                        type: "Slider",
                        props: {
                          label: "Global bounce",
                          value: {
                            bind: "bounce",
                          },
                          min: 0,
                          max: 1,
                          step: 0.05,
                          hint: "Controls how much motion remains after impact.",
                          className: "w-full",
                        },
                      },
                      {
                        type: "Div",
                        props: {
                          className: "grid gap-3 sm:grid-cols-2",
                        },
                        children: [
                          {
                            type: "Button",
                            props: {
                              label: "Play / Pause",
                              onClick: {
                                action: "togglePlay",
                              },
                              variant: "primary",
                              className: "w-full",
                            },
                          },
                          {
                            type: "Button",
                            props: {
                              label: "Reset",
                              onClick: {
                                action: "resetSimulation",
                              },
                              variant: "secondary",
                              className: "w-full",
                            },
                          },
                        ],
                      },
                      {
                        type: "Alert",
                        props: {
                          className: "border-white/10 bg-slate-950/70",
                        },
                        children: [
                          {
                            type: "AlertTitle",
                            props: {
                              content: "{{strengthLevel}}",
                              className: "text-slate-100",
                            },
                          },
                          {
                            type: "AlertDescription",
                            props: {
                              content: "This setting is about {{gravityPercentOfEarth}}% of Earth's gravity.",
                              className: "text-slate-300",
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: "SectionCard",
                props: {
                  title: "Live drop simulation",
                  description: "Watch the same scene respond to changing gravity values in real time.",
                  className: "border-white/10 bg-slate-900/70 text-white",
                },
                children: [
                  {
                    type: "Div",
                    props: {
                      className: "space-y-4",
                    },
                    children: [
                      {
                        type: "DropSimulation",
                        props: {
                          gravity: {
                            expr: "activeGravity",
                          },
                          height: {
                            expr: "dropHeight",
                          },
                          objects: {
                            expr: "objects",
                          },
                          bounce: {
                            expr: "bounce",
                          },
                          play: {
                            expr: "play",
                          },
                          resetKey: {
                            expr: "resetKey",
                          },
                          className: "w-full rounded-2xl border border-white/10 bg-slate-950",
                        },
                      },
                      {
                        type: "Div",
                        props: {
                          className: "grid gap-4 md:grid-cols-4",
                        },
                        children: [
                          {
                            type: "StatCard",
                            props: {
                              label: "Gravity",
                              value: "{{gravityLabel}} m/s²",
                              className: "border-white/10 bg-slate-950/70 text-white",
                            },
                          },
                          {
                            type: "StatCard",
                            props: {
                              label: "Fall time",
                              value: "{{round(fallTime * 100) / 100}} s",
                              className: "border-white/10 bg-slate-950/70 text-white",
                            },
                          },
                          {
                            type: "StatCard",
                            props: {
                              label: "Impact speed",
                              value: "{{round(impactSpeed * 100) / 100}} m/s",
                              className: "border-white/10 bg-slate-950/70 text-white",
                            },
                          },
                          {
                            type: "StatCard",
                            props: {
                              label: "Bounce",
                              value: "{{round(bounce * 100)}}%",
                              className: "border-white/10 bg-slate-950/70 text-white",
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
        ],
      },
      {
        type: "Section",
        props: {
          className: "mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8 lg:pb-16",
        },
        children: [
          {
            type: "Div",
            props: {
              className: "grid gap-6 lg:grid-cols-2",
            },
            children: [
              {
                type: "SectionCard",
                props: {
                  title: "Gravity comparison",
                  description: "Compare common planetary gravity values at a glance.",
                  className: "border-white/10 bg-slate-900/70 text-white",
                },
                children: [
                  {
                    type: "DataTable",
                    props: {
                      className: "w-full",
                      columns: [
                        {
                          key: "planet",
                          label: "Planet",
                          headerClassName: "text-slate-300",
                        },
                        {
                          key: "gravity",
                          label: "Gravity",
                          headerClassName: "text-slate-300",
                        },
                        {
                          key: "feel",
                          label: "Relative feel",
                          headerClassName: "text-slate-300",
                        },
                      ],
                      rows: {
                        expr: "planetFacts",
                      },
                    },
                  },
                ],
              },
              {
                type: "SectionCard",
                props: {
                  title: "What to notice",
                  description: "Key ideas to observe while you change the simulation.",
                  className: "border-white/10 bg-slate-900/70 text-white",
                },
                children: [
                  {
                    type: "Div",
                    props: {
                      className: "grid gap-4 md:grid-cols-3",
                    },
                    children: [
                      {
                        type: "InfoCard",
                        "each": {
                          "expr": "learningCards",
                          "item": "card",
                          "index": "i"
                        },
                        props: {
                          title: {
                            expr: "card.title",
                          },
                          description: {
                            expr: "card.description",
                          },
                          className: "border-white/10 bg-slate-950/60 text-white",
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
        type: "Section",
        props: {
          className: "border-t border-white/10 bg-slate-900/50",
        },
        children: [
          {
            type: "Div",
            props: {
              className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
            },
            children: [
              {
                type: "SectionCard",
                props: {
                  title: "Frequently asked questions",
                  description: "Simple explanations for what the simulation is showing.",
                  className: "border-white/10 bg-slate-900/70 text-white",
                },
                children: [
                  {
                    type: "Div",
                    props: {
                      className: "grid gap-4 md:grid-cols-3",
                    },
                    children: [
                      {
                        type: "InfoCard",
                        each: {
                          expr: "faq",
                          item: "faqItem",
                          index: "i",
                        },
                        props: {
                          title: {
                            expr: "faqItem.title",
                          },
                          description: {
                            expr: "faqItem.description",
                          },
                          className: "border-white/10 bg-slate-950/60 text-white",
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
    ],
  },
};

export const interestSchemaString = JSON.stringify(interestSchemaObject);

export const interestSchemaFromString = JSON.parse(interestSchemaString);

export default interestSchemaFromString;
