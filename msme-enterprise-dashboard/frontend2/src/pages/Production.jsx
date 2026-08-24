import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import "./styles/Production.css";

import { getProductions } from "../services/api";


/* =========================================================
   COMPANY
========================================================= */

const COMPANY_ID = "68a123456789abcdef123456";


/* =========================================================
   HELPERS
========================================================= */

const pad2 = (n) =>
  String(n).padStart(2, "0");


const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);


const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


/* =========================================================
   GAUGE ARC
========================================================= */

const GAUGE_START = 220;
const GAUGE_SWEEP = 240;


function toRad(deg) {
  return (
    (deg - 90) *
    (Math.PI / 180)
  );
}


function describeArc(
  cx,
  cy,
  r,
  startDeg,
  endDeg
) {
  const sweep =
    endDeg - startDeg;

  if (Math.abs(sweep) < 0.01) {
    return "";
  }

  const safeSweep =
    sweep >= 360
      ? 359.999
      : sweep;

  const safeEnd =
    startDeg + safeSweep;

  const x1 =
    cx +
    r *
      Math.cos(
        toRad(startDeg)
      );

  const y1 =
    cy +
    r *
      Math.sin(
        toRad(startDeg)
      );

  const x2 =
    cx +
    r *
      Math.cos(
        toRad(safeEnd)
      );

  const y2 =
    cy +
    r *
      Math.sin(
        toRad(safeEnd)
      );

  const largeArcFlag =
    safeSweep > 180
      ? 1
      : 0;

  return `
    M ${x1.toFixed(4)} ${y1.toFixed(4)}
    A ${r} ${r} 0 ${largeArcFlag} 1
    ${x2.toFixed(4)} ${y2.toFixed(4)}
  `;
}


/* =========================================================
   CIRCLE GAUGE
========================================================= */

function CircleGauge({
  label,
  sub,
  value,
  max,
  pct,
  color,
  accent,
  fmt,
}) {
  const cx = 50;
  const cy = 52;
  const r = 38;

  const rTick = 43;
  const rTickOuter = 48;

  const trackD =
    describeArc(
      cx,
      cy,
      r,
      GAUGE_START,
      GAUGE_START +
        GAUGE_SWEEP
    );

  const clampedPct =
    Math.max(
      0,
      Math.min(
        pct || 0,
        100
      )
    );

  const fillSweep =
    (clampedPct / 100) *
    GAUGE_SWEEP;

  const fillD =
    clampedPct > 0
      ? describeArc(
          cx,
          cy,
          r,
          GAUGE_START,
          GAUGE_START +
            (clampedPct >= 100
              ? GAUGE_SWEEP -
                0.001
              : fillSweep)
        )
      : "";

  const tickAngles = [
    GAUGE_START,

    GAUGE_START +
      GAUGE_SWEEP * 0.5,

    GAUGE_START +
      GAUGE_SWEEP,
  ];

  const ticks =
    tickAngles.map(
      (deg) => ({
        x1:
          cx +
          rTick *
            Math.cos(
              toRad(deg)
            ),

        y1:
          cy +
          rTick *
            Math.sin(
              toRad(deg)
            ),

        x2:
          cx +
          rTickOuter *
            Math.cos(
              toRad(deg)
            ),

        y2:
          cy +
          rTickOuter *
            Math.sin(
              toRad(deg)
            ),
      })
    );

  const rLabel = r + 14;

  const minPos = {
    x:
      cx +
      rLabel *
        Math.cos(
          toRad(
            GAUGE_START
          )
        ),

    y:
      cy +
      rLabel *
        Math.sin(
          toRad(
            GAUGE_START
          )
        ),
  };

  const maxPos = {
    x:
      cx +
      rLabel *
        Math.cos(
          toRad(
            GAUGE_START +
              GAUGE_SWEEP
          )
        ),

    y:
      cy +
      rLabel *
        Math.sin(
          toRad(
            GAUGE_START +
              GAUGE_SWEEP
          )
        ),
  };

  const displayStr =
    fmt(value || 0);

  const fontSize =
    displayStr.length > 6
      ? 11
      : displayStr.length > 4
      ? 14
      : 18;

  const glowId =
    `glow-${label
      .replace(/\s+/g, "-")
      .toLowerCase()}`;

  return (
    <div className="gauge-card">

      {/* Accent strip */}

      <div
        className="gauge-card-top"
        style={{
          background: accent,
        }}
      />

      <div className="gauge-svg-wrap">

        <svg
          viewBox="0 0 100 100"
          className="gauge-svg"
        >

          <defs>

            <filter
              id={glowId}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >

              <feGaussianBlur
                stdDeviation="1.5"
                result="blur"
              />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>

            </filter>

          </defs>


          {/* Gauge track */}

          <path
            d={trackD}
            fill="none"
            stroke="var(--forge-groove)"
            strokeWidth={7}
            strokeLinecap="round"
          />


          {/* Gauge value */}

          {fillD && (
            <path
              d={fillD}
              fill="none"
              stroke={color}
              strokeWidth={7}
              strokeLinecap="round"
              filter={`url(#${glowId})`}
              opacity={0.92}
            />
          )}


          {/* Tick marks */}

          {ticks.map(
            (tick, index) => (
              <line
                key={index}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke="var(--text-faint)"
                strokeWidth={0.8}
              />
            )
          )}


          {/* Main value */}

          <text
            x={cx}
            y={48}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-brand)"
            fontSize={fontSize}
            fill={color}
            filter={`url(#${glowId})`}
          >
            {displayStr}
          </text>


          {/* Gauge label */}

          <text
            x={cx}
            y={62}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-mono)"
            fontSize={5.5}
            fill="var(--text-faint)"
            letterSpacing={0.8}
          >
            {label}
          </text>


          {/* Minimum */}

          <text
            x={minPos.x}
            y={minPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-mono)"
            fontSize={4.5}
            fill="var(--text-faint)"
          >
            0
          </text>


          {/* Maximum */}

          <text
            x={maxPos.x}
            y={maxPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-mono)"
            fontSize={4.5}
            fill="var(--text-faint)"
          >
            {fmt(max || 0)}
          </text>

        </svg>

      </div>


      <div className="gauge-card-label">
        {sub}
      </div>

    </div>
  );
}


/* =========================================================
   MAIN PRODUCTION COMPONENT
========================================================= */

export default function Production() {

  const [loading, setLoading] =
    useState(true);

  const [spinning, setSpinning] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [records, setRecords] =
    useState([]);

  const [lastUpdated, setLastUpdated] =
    useState("");


  /* =======================================================
     LOAD PRODUCTION DATA
  ======================================================= */

  const loadData =
    useCallback(
      async () => {

        try {

          setLoading(true);
          setError("");

          const response =
            await getProductions(
              COMPANY_ID
            );

          console.log(
            "Production API:",
            response?.data
          );

          const responseData =
            response?.data?.data;

          let productionData = [];


          /*
            Supports:

            { data: [...] }

            and

            { data: { data: [...] } }
          */

          if (
            Array.isArray(
              responseData
            )
          ) {

            productionData =
              responseData;

          } else if (
            Array.isArray(
              responseData?.data
            )
          ) {

            productionData =
              responseData.data;
          }


          setRecords(
            productionData
          );

          setLastUpdated(
            new Date()
              .toLocaleTimeString()
          );

        } catch (err) {

          console.error(
            "Production fetch error:",
            err
          );

          setError(
            err?.response
              ?.data
              ?.message ||
              "Unable to load production data."
          );

          setRecords([]);

        } finally {

          setLoading(false);
        }

      },
      []
    );


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadData();
  }, [loadData]);


  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    useCallback(
      async () => {

        if (spinning) {
          return;
        }

        setSpinning(true);

        try {

          await loadData();

        } finally {

          setSpinning(false);
        }

      },
      [loadData, spinning]
    );


  /* =======================================================
     STATISTICS
  ======================================================= */

  const stats =
    useMemo(() => {

      const planned =
        records.reduce(
          (sum, item) =>
            sum +
            Number(
              item?.plannedQuantity ||
                0
            ),
          0
        );


      const actual =
        records.reduce(
          (sum, item) =>
            sum +
            Number(
              item?.actualQuantity ||
                0
            ),
          0
        );


      const defective =
        records.reduce(
          (sum, item) =>
            sum +
            Number(
              item?.defectiveQuantity ||
                0
            ),
          0
        );


      const cost =
        records.reduce(
          (sum, item) =>
            sum +
            Number(
              item?.productionCost ||
                0
            ),
          0
        );


      const efficiency =
        planned > 0
          ? (actual / planned) * 100
          : 0;


      const defectRate =
        actual > 0
          ? (defective / actual) * 100
          : 0;


      return {
        planned,
        actual,
        defective,
        cost,
        efficiency,
        defectRate,
      };

    }, [records]);


  /* =======================================================
     BEST EFFICIENCY RECORD
  ======================================================= */

  const bestId =
    useMemo(() => {

      if (!records.length) {
        return null;
      }

      let best = -1;
      let bestRec = null;


      for (
        const record of records
      ) {

        const planned =
          Number(
            record?.plannedQuantity ||
              0
          );

        const actual =
          Number(
            record?.actualQuantity ||
              0
          );


        const ratio =
          planned > 0
            ? actual / planned
            : 0;


        if (ratio > best) {

          best = ratio;
          bestRec = record;
        }
      }


      return (
        bestRec?._id ??
        null
      );

    }, [records]);


  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredRecords =
    useMemo(() => {

      const q =
        search
          .trim()
          .toLowerCase();


      if (!q) {
        return records;
      }


      return records.filter(
        (record) => {

          const productName =
            String(
              record?.productName ||
                ""
            ).toLowerCase();


          const productId =
            String(
              record?.productId ||
                ""
            ).toLowerCase();


          return (
            productName.includes(q) ||
            productId.includes(q)
          );
        }
      );

    }, [records, search]);


  /* =======================================================
     STATUS COLORS
     IMPORTANT:
     CSS VARIABLES KEEP DARK + LIGHT THEMES SEPARATE.
  ======================================================= */

  const effColor =
    stats.efficiency >= 95
      ? "var(--prod-good)"
      : stats.efficiency >= 85
      ? "var(--prod-warn)"
      : "var(--prod-danger)";


  const defColor =
    stats.defectRate < 1
      ? "var(--prod-good)"
      : stats.defectRate < 5
      ? "var(--prod-warn)"
      : "var(--prod-danger)";


  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="prod-root">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="prod-header">

        <div className="prod-header-left">

          <div className="prod-header-accent" />

          <div className="prod-header-text">

            <div className="prod-header-label">
              MSME OPERATIONS · PRODUCTION MODULE
            </div>

            <div className="prod-header-title">
              PRODUCTION FLOOR
            </div>

          </div>

        </div>


        <div className="prod-header-right">

          <div className="prod-live-badge">

            <div className="prod-led" />

            FLOOR ACTIVE

          </div>


          {lastUpdated && (
            <span
              style={{
                fontFamily:
                  "var(--font-mono)",
                fontSize: 8,
                letterSpacing:
                  "0.12em",
                color:
                  "var(--text-faint)",
              }}
            >
              {lastUpdated}
            </span>
          )}


          <button
            className="prod-refresh-btn"
            onClick={
              handleRefresh
            }
            disabled={
              spinning || loading
            }
          >

            <svg
              className={
                spinning
                  ? "spin"
                  : ""
              }
              width={11}
              height={11}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >

              <polyline
                points="23 4 23 10 17 10"
              />

              <path
                d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"
              />

            </svg>

            REFRESH

          </button>

        </div>

      </div>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="prod-error">
          ERR · {error}
        </div>
      )}


      {/* ===================================================
          KPI GAUGES
      =================================================== */}

      <div className="prod-gauge-grid">


        <CircleGauge
          label="TOTAL OUTPUT"
          sub="ACTUAL UNITS PRODUCED"

          value={stats.actual}

          max={
            stats.planned || 1
          }

          pct={
            stats.efficiency
          }

          color="var(--prod-output)"
          accent="var(--prod-output)"

          fmt={(value) =>
            (value / 1000)
              .toFixed(1) + "K"
          }
        />


        <CircleGauge
          label="PLANNED TARGET"
          sub="SCHEDULED UNITS"

          value={stats.planned}

          max={
            stats.planned || 1
          }

          pct={100}

          color="var(--prod-target)"
          accent="var(--prod-target)"

          fmt={(value) =>
            (value / 1000)
              .toFixed(1) + "K"
          }
        />


        <CircleGauge
          label="EFFICIENCY"
          sub="ACTUAL VS PLANNED"

          value={
            stats.efficiency
          }

          max={100}

          pct={
            stats.efficiency
          }

          color={effColor}
          accent={effColor}

          fmt={(value) =>
            value.toFixed(1) + "%"
          }
        />


        <CircleGauge
          label="DEFECT RATE"
          sub="QUALITY INDICATOR"

          value={
            stats.defectRate
          }

          max={10}

          pct={
            stats.defectRate * 10
          }

          color={defColor}
          accent={defColor}

          fmt={(value) =>
            value.toFixed(2) + "%"
          }
        />

      </div>


      {/* ===================================================
          RECORDS PANEL
      =================================================== */}

      <div className="prod-panel">


        {/* PANEL HEADER */}

        <div className="prod-panel-header">

          <div className="prod-panel-tab" />

          <div className="prod-panel-title-area">

            <span className="prod-panel-title">
              PRODUCTION RECORDS
            </span>

            <span className="prod-count-badge">
              {
                filteredRecords.length
              } RECORDS
            </span>

          </div>

        </div>


        {/* =================================================
            SEARCH TOOLBAR
        ================================================= */}

        <div className="prod-toolbar">

          <div className="prod-search">

            <svg
              width={12}
              height={12}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-faint)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >

              <circle
                cx={11}
                cy={11}
                r={8}
              />

              <line
                x1={21}
                y1={21}
                x2={16.65}
                y2={16.65}
              />

            </svg>


            <input
              type="text"
              placeholder="SEARCH PRODUCT OR ID..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>


          <div className="prod-cost-badge">

            TOTAL COST:

            <span className="prod-cost-value">

              {formatCurrency(
                stats.cost
              )}

            </span>

          </div>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="prod-state">

            <div className="prod-loading-ring" />

            <span>
              LOADING PRODUCTION RECORDS
              <span
                style={{
                  animation:
                    "blink 1.2s step-start infinite",
                  marginLeft: 2,
                }}
              >
                ...
              </span>
            </span>

          </div>
        )}


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!loading &&
          !error &&
          filteredRecords.length ===
            0 && (

            <div className="prod-state">

              <svg
                width={28}
                height={28}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >

                <rect
                  x={2}
                  y={3}
                  width={20}
                  height={14}
                  rx={2}
                  ry={2}
                />

                <line
                  x1={8}
                  y1={21}
                  x2={16}
                  y2={21}
                />

                <line
                  x1={12}
                  y1={17}
                  x2={12}
                  y2={21}
                />

              </svg>

              NO RECORDS FOUND

            </div>
          )}


        {/* =================================================
            TABLE
        ================================================= */}

        {!loading &&
          filteredRecords.length > 0 && (

            <div className="prod-table-wrap">

              <table className="prod-table">

                <thead>

                  <tr>
                    <th>#</th>
                    <th>PRODUCT</th>
                    <th>PLANNED</th>
                    <th>ACTUAL</th>
                    <th>DEFECTIVE</th>
                    <th>EFFICIENCY</th>
                    <th>PROD. COST</th>
                    <th>DATE</th>
                  </tr>

                </thead>


                <tbody>

                  {filteredRecords.map(
                    (item, idx) => {

                      const planned =
                        Number(
                          item?.plannedQuantity ||
                            0
                        );


                      const actual =
                        Number(
                          item?.actualQuantity ||
                            0
                        );


                      const defective =
                        Number(
                          item?.defectiveQuantity ||
                            0
                        );


                      const eff =
                        planned > 0
                          ? (actual / planned) *
                            100
                          : 0;


                      const status =
                        eff >= 95
                          ? "good"
                          : eff >= 85
                          ? "warn"
                          : "danger";


                      const statusColor =
                        eff >= 95
                          ? "var(--prod-good)"
                          : eff >= 85
                          ? "var(--prod-warn)"
                          : "var(--prod-danger)";


                      const isBest =
                        item?._id === bestId;


                      return (
                        <tr
                          key={
                            item?._id ||
                            `${item?.productId}-${idx}`
                          }
                          className={
                            isBest
                              ? "row-best"
                              : ""
                          }
                        >


                          {/* NUMBER */}

                          <td
                            style={{
                              color:
                                "var(--text-faint)",
                              fontSize: 9,
                            }}
                          >
                            {pad2(idx + 1)}
                          </td>


                          {/* PRODUCT */}

                          <td>

                            <div className="prod-product-cell">

                              <div className="prod-product-icon">

                                <svg
                                  width={15}
                                  height={15}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={1.8}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >

                                  <rect
                                    x={2}
                                    y={7}
                                    width={20}
                                    height={14}
                                    rx={1}
                                  />

                                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />

                                  <line
                                    x1={12}
                                    y1={12}
                                    x2={12}
                                    y2={16}
                                  />

                                  <line
                                    x1={10}
                                    y1={14}
                                    x2={14}
                                    y2={14}
                                  />

                                </svg>

                              </div>


                              <div>

                                <div className="prod-product-name">
                                  {
                                    item?.productName ||
                                    "Unknown Product"
                                  }
                                </div>

                                <div className="prod-product-id">
                                  {
                                    item?.productId ||
                                    "-"
                                  }
                                </div>

                              </div>


                              {isBest && (
                                <span
                                  className="prod-top-badge"
                                >
                                  TOP
                                </span>
                              )}

                            </div>

                          </td>


                          {/* PLANNED */}

                          <td className="prod-value-cell">
                            {planned.toLocaleString(
                              "en-IN"
                            )}
                          </td>


                          {/* ACTUAL */}

                          <td
                            className="prod-value-cell"
                            style={{
                              color:
                                actual >= planned
                                  ? "var(--prod-good)"
                                  : "var(--text-bright)",
                            }}
                          >
                            {actual.toLocaleString(
                              "en-IN"
                            )}
                          </td>


                          {/* DEFECTIVE */}

                          <td>

                            {defective > 0 ? (
                              <span className="def-badge">
                                {defective}
                              </span>
                            ) : (
                              <span className="def-zero">
                                —
                              </span>
                            )}

                          </td>


                          {/* EFFICIENCY */}

                          <td>

                            <div className="eff-bar-wrap">

                              <span
                                className={`eff-badge ${status}`}
                              >

                                <span
                                  className="prod-status-dot"
                                  style={{
                                    background:
                                      statusColor,
                                  }}
                                />

                                {eff.toFixed(1)}%

                              </span>


                              <div className="eff-mini-bar">

                                <div
                                  className="eff-mini-fill"
                                  style={{
                                    width: `${Math.min(
                                      eff,
                                      100
                                    )}%`,

                                    background:
                                      statusColor,
                                  }}
                                />

                              </div>

                            </div>

                          </td>


                          {/* COST */}

                          <td
                            className="prod-value-cell"
                            style={{
                              color:
                                "var(--amber)",
                            }}
                          >
                            {formatCurrency(
                              item?.productionCost
                            )}
                          </td>


                          {/* DATE */}

                          <td
                            style={{
                              color:
                                "var(--text-faint)",
                              fontSize: 9,
                            }}
                          >
                            {formatDate(
                              item?.productionDate
                            )}
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}


        {/* =================================================
            FOOTER TOTALS
        ================================================= */}

        {!loading &&
          records.length > 0 && (

            <div className="prod-footer">

              <div className="prod-footer-label">
                TOTALS
              </div>


              <div className="prod-footer-badges">


                <div className="prod-total-badge">

                  PLANNED

                  <span>
                    {stats.planned.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>


                <div className="prod-total-badge">

                  ACTUAL

                  <span>
                    {stats.actual.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>


                <div className="prod-total-badge">

                  DEFECTIVE

                  <span className="red">
                    {stats.defective.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>


                <div className="prod-total-badge">

                  COST

                  <span className="amber">
                    {formatCurrency(
                      stats.cost
                    )}
                  </span>

                </div>

              </div>

            </div>
          )}

      </div>

    </div>
  );
}