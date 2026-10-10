"""
Monte Carlo Simulation Engine for ARBITER-MVP v2.1
Seed: 424242
N = 10,000 iterations
"""
import sys
import json
import math
import random

def run_simulation(dimensions_path, output_path):
    with open(dimensions_path, "r") as f:
        data = json.load(f)

    dims = data["dimensions"]
    # Fixed weights
    weights = {
        "D1": 18.0, "D2": 14.0, "D3": 14.0, "D4": 8.0,
        "D5": 8.0, "D6": 8.0, "D7": 7.0, "D8": 6.0,
        "D9": 6.0, "D10": 5.0, "D11": 3.0, "D12": 3.0
    }

    # Deterministic RNG initialization (seed = 424242)
    rng = random.Random(424242)

    def triangular(low, mode, high):
        if low == high:
            return low
        u = rng.random()
        c = (mode - low) / (high - low)
        if u < c:
            return low + math.sqrt(u * (high - low) * (mode - low))
        else:
            return high - math.sqrt((1.0 - u) * (high - low) * (high - mode))

    def normal(mean, sigma):
        # Box-Muller transform
        u1 = max(1e-15, rng.random())
        u2 = rng.random()
        z0 = math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)
        return mean + z0 * sigma

    N = 10000
    R_i = []

    # Calculate point estimate
    r_point = sum((weights[d] / 100.0) * dims[d]["score"] for d in weights)

    for _ in range(N):
        epsilon = normal(0.0, 3.0)  # systematic bias
        sim_sum = 0.0
        for d, w in weights.items():
            low = dims[d]["min"]
            mode = dims[d]["mode"]
            high = dims[d]["max"]
            v_d = triangular(low, mode, high)
            sim_sum += (w / 100.0) * v_d
        r_val = epsilon + sim_sum
        r_val = max(0.0, min(100.0, r_val))
        R_i.append(r_val)

    R_i.sort()
    r_mean = sum(R_i) / N
    p2_5 = R_i[int(0.025 * N)]
    p97_5 = R_i[int(0.975 * N)]
    p_go_raw = sum(1 for x in R_i if x >= 75.0) / float(N)

    result = {
        "N": N,
        "seed": 424242,
        "R_point": round(r_point, 1),
        "R_mean": round(r_mean, 1),
        "CI95": [round(p2_5, 1), round(p97_5, 1)],
        "P_GO_raw": round(p_go_raw, 4)
    }

    print(json.dumps(result, indent=2))
    with open(output_path, "w") as out_f:
        out_f.write(json.dumps(result, indent=2) + "\n")

if __name__ == "__main__":
    scorecard_file = sys.argv[1] if len(sys.argv) > 1 else "audit/02_scorecard.json"
    out_file = sys.argv[2] if len(sys.argv) > 2 else "audit/mc_out.txt"
    run_simulation(scorecard_file, out_file)
