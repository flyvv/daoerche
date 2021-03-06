import { Metric, PerfName } from "./metric";
import { observe } from "./observer";
import { bindReporter, initMetric } from "../utils";
import { clearMeasure, getBusinessPointPerfName } from "./profiling";

/**
 * 页面资源获取耗时
 * @param onReport
 */
export function getMeasure(onReport: (metric: Metric) => void) {
  let metric: Metric;

  const entryHandler = (entry: PerformanceEntry) => {
    const measureName = entry.name;
    const perfName = getBusinessPointPerfName(measureName) as PerfName;
    // 没有获取到perfName的话说明这个Measure不是通过本身库调用的，因此不上报
    if (!perfName) return;
    metric = initMetric(perfName, entry);

    const report = bindReporter(onReport, metric);
    const success = report();
    if (!success) {
      console.error(`${perfName} report失败 [metric]: ${JSON.stringify(metric)}`);
    }

    clearMeasure(measureName);
  };

  const stopListening = () => {
    if (po) {
      po.disconnect();
      po = undefined;
    }
  }

  let po = observe('measure', entryHandler);
  window.addEventListener('beforeunload', stopListening, false);
}
