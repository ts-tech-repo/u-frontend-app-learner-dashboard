import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as echarts from "echarts";

const CustomAccordionItem = ({ title, percentage, children, isOpen, onToggle }) => (
  <div className="accordion-item border shadow-sm mb-2 rounded">
    <h2 className="accordion-header">
      <button
        className={`accordion-button d-flex justify-content-between align-items-center gap-3 ${!isOpen ? "collapsed" : ""}`}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          fontWeight: 600,
          backgroundColor: "#f8f9fa",
          padding: "1rem 1.25rem",
        }}
      >
        <span className="flex-grow-1 text-start">{title}</span>
        <span className="badge bg-primary fs-6">{percentage}%</span>
      </button>
    </h2>
    <div className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}>
      <div className="accordion-body bg-white p-3">{children}</div>
    </div>
  </div>
);

const AttendanceReport = ({ course_name, homeUrl, cohort_name, name, description }) => {
  const [percentageData, setPercentageData] = useState([]);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const tooltipRef = useRef(null);

  const extractOrg = (url) => {
    if (url && typeof url === "string") {
      const match = url.match(/course-v1:([^+]+)/);
      return match?.[1] || "";
    }
    return "";
  };

  useEffect(() => {
    const org = extractOrg(homeUrl);
    if (!org || !course_name) {
      setError("Missing course or organization");
      setLoading(false);
      return;
    }

    const url = `/attendance_report_data?site=${encodeURIComponent(org)}&cohort_name=${encodeURIComponent(cohort_name)}`;
    axios
      .get(url)
      .then((response) => {
        let data = response.data;
        if (typeof data === "string") data = JSON.parse(data);

        setPercentageData(data.percentage || []);
        setSessionSummary(data.session_summary?.[0] || null);
        setAttendance(data.attendance || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Attendance fetch error:", err.message);
        setError("Failed to load attendance data");
        setLoading(false);
      });
  }, [course_name, homeUrl]);

  const overallPercentage = sessionSummary?.overall_percentage || "N/A";

  const courseIdMap = {};
  percentageData.forEach((c) => {
    courseIdMap[c.course] = c.course_id;
  });

  const groupedAttendance = {};
  attendance.forEach((row) => {
    if (!groupedAttendance[row.course_id]) groupedAttendance[row.course_id] = [];
    groupedAttendance[row.course_id].push(row);
  });

  // Compute overall status counts
  const overallStatusCounts = {};
  attendance.forEach((row) => {
    const status = row.status_description?.trim() || "Unknown";
    overallStatusCounts[status] = (overallStatusCounts[status] || 0) + 1;
  });
  const totalSessions = attendance.length;

  const barData = percentageData.map((c) => {
    let percentage =
      typeof c.percentagesessionscompleted === "string"
        ? parseFloat(c.percentagesessionscompleted.replace("%", ""))
        : Number(c.percentagesessionscompleted);
    percentage = isNaN(percentage) ? 0 : percentage;
    return { name: c.course, value: percentage };
  });

  // ECharts rendering logic
  useEffect(() => {
    if (showTable) return;

    const renderChart = () => {
      if (!chartRef.current || barData.length === 0) return;

      if (chartInstanceRef.current) chartInstanceRef.current.dispose();

      const chart = echarts.init(chartRef.current);
      chartInstanceRef.current = chart;

      let labelFontSize = 12;
      const numBars = barData.length;
      const screenWidth = window.innerWidth;

      if (screenWidth < 600) {
        if (numBars > 8) labelFontSize = 8;
        else if (numBars > 5) labelFontSize = 9;
        else labelFontSize = 10;
      } else {
        if (numBars > 10) labelFontSize = 9;
        else if (numBars > 6) labelFontSize = 10;
        else labelFontSize = 12;
      }

      const options = {
        backgroundColor: "#fff",
        tooltip: {
          trigger: "axis",
          confine: true,
          enterable: true,
          backgroundColor: "rgba(50, 50, 50, 0.9)",
          textStyle: {
            color: "#fff",
            fontSize: screenWidth < 600 ? 10 : 12,
            width: 150,
            overflow: "break",
            lineHeight: 18,
          },
          // Enhanced tooltip with per-course status counts
          formatter: (params) => {
            const idx = params[0].dataIndex;
            const courseName = barData[idx].name;
            const value = barData[idx].value;
            const courseId = courseIdMap[courseName];
            const courseSessions = groupedAttendance[courseId] || [];

            const statusCounts = {};
            courseSessions.forEach((row) => {
              const status = row.status_description?.trim() || "Unknown";
              statusCounts[status] = (statusCounts[status] || 0) + 1;
            });

            const statusLines = Object.entries(statusCounts)
              .map(([status, count]) => `${status}: ${count}`)
              .join("<br/>");

            return `
              <div style="white-space: normal; word-wrap: break-word; max-width: 180px;">
                <b>${courseName}</b><br/>
                Attendance: ${value}%<br/>
                ${statusLines ? `<hr style="margin:4px 0;"/>${statusLines}` : ""}
              </div>
            `;
          },
        },
        grid: {
          top: 50,
          bottom: 100,
          left: 50,
          right: 20,
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: barData.map((_, idx) => {
                  const name = barData[idx].name;
                  const shortName = name.length > 15 ? name.slice(0, 15) + "..." : name;
                  return `${shortName}`;
                }),
          name: "",
          nameLocation: "middle",
          nameGap: 35,
          nameTextStyle: { fontSize: 14, fontWeight: "bold" },
          axisLine: { lineStyle: { color: "#333" } },
          axisLabel: {
            color: "#333",
            fontSize: labelFontSize,
            rotate: 30,
            interval: 0,
          },
        },
        yAxis: {
          type: "value",
          min: 0,
          max: 100,
          name: "Attendance %",
          nameLocation: "middle",
          nameGap: 50,
          nameRotate: 90,
          nameTextStyle: { fontSize: 14, fontWeight: "bold" },
          axisLine: { show: true, lineStyle: { color: "#333" } },
          axisLabel: { color: "#333", fontSize: 12 },
        },
        series: [
          {
            data: barData.map((b) => b.value),
            type: "bar",
            barWidth: "40%",
            itemStyle: { color: "#15376d" },
            label: {
              show: window.innerWidth >= 992,
              position: "top",
              formatter: "{c}%",
              fontWeight: "bold",
              color: "#000",
              fontSize: screenWidth < 600 ? 7 : 12,
            },
          },
        ],
      };

      chart.setOption(options);
      chart.resize();
      const zr = chart.getZr();
      let labelHoverIndex = -1;

      const buildHtml = (idx) => barData[idx].name;

      zr.on("mousemove", (e) => {
        try {
          const gridRect = chart.getModel().getComponent("grid", 0).coordinateSystem.getRect();
          const bottomEdge = gridRect.y + gridRect.height;
          // Tighter label zone — only 60px below grid bottom (where rotated labels are)
          const inLabelZone = e.offsetY > bottomEdge &&
                              e.offsetY < bottomEdge + 60 &&
                              e.offsetX >= gridRect.x &&
                              e.offsetX <= gridRect.x + gridRect.width;

          if (!inLabelZone) {
            tooltipRef.current.style.display = "none";
            labelHoverIndex = -1;
            return;
          }

          const idx = Math.floor((e.offsetX - gridRect.x) / (gridRect.width / barData.length));
          if (idx < 0 || idx >= barData.length) return;

          labelHoverIndex = idx;
          const tip = tooltipRef.current;
          tip.innerHTML = buildHtml(idx);
          tip.style.display = "block";
          // Position near cursor but clamped so it doesn't go off-screen
          tip.style.left = (e.event.clientX + 12) + "px";
          tip.style.top  = (e.event.clientY - 60) + "px";
        } catch (err) { console.log(err); }
      });

      zr.on("mouseout", () => {
        tooltipRef.current.style.display = "none";
        labelHoverIndex = -1;
      });
    };

    setTimeout(renderChart, 150);
    const handleResize = () => chartInstanceRef.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstanceRef.current?.dispose();
    };
  }, [barData, showTable]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "10vh" }}>
        <i className="fa-solid fa-spinner fa-spin fa-2x text-primary"></i>
      </div>
    );

  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="container" style={{ overflow: "visible" }}>
      {name && <h3 className="attendance-heading text-center fw-bold pb-3">{name}</h3>}

      {!showTable ? (
        <div className="row mb-1">
          <div className="col-12 col-md-8 mb-1 mb-md-0">
            <h4 class="text-center mb-0">Course Wise Attendance</h4>
            <div className="card px-3 border-0" style={{ overflow: "visible" }}>
              <div ref={chartRef} style={{ width: "100%", height: "400px", minHeight: "300px" }}></div>
              <div ref={tooltipRef} style={{
                position: "fixed", display: "none", zIndex: 9999,
                background: "rgba(50,50,50,0.9)", color: "#fff",
                padding: "4px 8px", borderRadius: "4px", fontSize: "12px",
                pointerEvents: "none", maxWidth: "180px"
              }} />
            </div>
          </div>

          {/* Static Summary Below Overall Percentage */}
          <div className="col-12 col-md-4 text-center">
            <h4>Overall Attendance</h4>
            <h1 className="fw-bold display-4 mt-lg-5 mt-0">{overallPercentage}%</h1>

            <div className="mt-3 shadow rounded p-2 small text-start d-inline-block">
              <b>Overall Sessions:</b> {totalSessions}
              <hr className="my-1" />
              {Object.entries(overallStatusCounts).map(([status, count]) => (
                <div key={status}>
                  {status}: {count}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="accordion" id="customAccordion">
          {barData.map((course, idx) => {
            const isOpen = openIndex === idx;
            return (
              <CustomAccordionItem
                key={idx}
                title={course.name}
                percentage={course.value}
                isOpen={isOpen}
                onToggle={() => setOpenIndex(isOpen ? null : idx)}
              >
                <table className="table table-bordered table-hover table-sm">
                  <thead className="table-light">
                    <tr>
                      <th>Session Date</th>
                      <th>Session Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                  {groupedAttendance[courseIdMap[course.name]]?.length > 0 ? (
                    groupedAttendance[courseIdMap[course.name]].map((row, i) => {
                      // Determine which dot color class to apply
                      let dotClass = "";
                      const status = row.status_description?.trim()?.toLowerCase();

                      if (status === "present") dotClass = "present_dot";
                      else if (status === "late") dotClass = "late_dot";
                      else if (status === "absent") dotClass = "absent_dot";
                      else if (status === "excused") dotClass = "excused_dot";

                      return (
                        <tr key={i}>
                          <td className="text-start d-flex"> <span className={dotClass} style={{ marginRight: "6px" }}>•</span> {row.session_created}</td>
                          <td>{row.session_name}</td>
                          <td>
                            {row.status_description}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-muted text-center">
                        No sessions available
                      </td>
                    </tr>
                  )}
                </tbody>
                </table>
              </CustomAccordionItem>
            );
          })}
        </div>
      )}

      {attendance && attendance.length > 0 && barData.length > 0 && (
        <div className="text-right my-1 mt-3">
          <button className="btn btn-primary" onClick={() => setShowTable(!showTable)}>
            {showTable ? "Show Chart" : "Show Table"}
          </button>
        </div>
      )}

      {description &&
        description.split("|").map((line, idx) => (
          <p key={idx} className="small mb-1 fw-bold text-dark">
            {line.trim()}
          </p>
        ))}
    </div>
  );
};

export default AttendanceReport;
