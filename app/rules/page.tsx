"use client";

import React from "react";
import { Collapse } from "antd";
import "@/styles/globals.css"; 

const { Panel } = Collapse;

export default function ScopaInstructions() {
  return (
    <div style={{ padding: "2rem 0" }}>
      <h2
        style={{
          textAlign: "center",
          color: "#fff",
          marginBottom: "2rem",
          fontSize: "1.75rem",
        }}
      >
        Hi, it’s great to see you’re curious about how to play Scopa! 🤓
      </h2>

      <div className="scopaContainer">
        <Collapse
          accordion
          className="scopaCollapse"
          bordered={false}
          expandIconPosition="right"
        >
          <Panel header="Game Setup" key="1">
            <ul>
              <li>At the start, 4 cards are placed on the table.</li>
              <li>Each player receives 9 cards.</li>
              <li>
                Players take seats in a circle. Players sitting in alternating
                positions form teams (e.g., player 1 & 3 vs. player 2 & 4).
              </li>
            </ul>
          </Panel>

          <Panel header="Turn Flow" key="2">
            <ol>
              <li>On your turn, choose a card from your hand and play it.</li>
              <li>
                Once you play a card:
                <ul>
                  <li>The card is removed from your hand.</li>
                  <li>The table is checked for possible captures.</li>
                </ul>
              </li>
              <li>
                Capture Options:
                <ul>
                  <li>
                    <strong>Deterministic Capture:</strong> a single matching card
                    on the table is captured automatically.
                  </li>
                  <li>
                    <strong>Non-deterministic Capture:</strong> choose among
                    multiple valid combinations.
                  </li>
                  <li>
                    <strong>No Capture:</strong> your card simply remains on the
                    table.
                  </li>
                </ul>
              </li>
              <li>
                If a capture empties the table (except on the last turn), that’s
                a <strong>scopa</strong>—worth an extra point.
              </li>
              <li>The turn then passes to the next player.</li>
            </ol>
          </Panel>

          <Panel header="Capture Rules and Scenarios" key="3">
            <ol>
              <li>
                <strong>Deterministic Capture</strong>
                <ul>
                  <li>
                    If you play a 7 and there’s exactly one 7 on the table,
                    you capture it automatically.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Non-Deterministic Capture</strong>
                <ul>
                  <li>
                    If no single match exists, you may capture combinations whose
                    sum equals your card.
                  </li>
                  <li>e.g. 3+4 = 7 or 2+2+3 = 7.</li>
                </ul>
              </li>
              <li>
                <strong>Multiple Identical Cards</strong>
                <ul>
                  <li>
                    If two 7s are on the table, you select which one to capture.
                  </li>
                </ul>
              </li>
            </ol>
          </Panel>

          <Panel header="Scoring Rules" key="4">
            <ul>
              <li>
                <strong>Cards:</strong> &gt; 20 cards captured = 1 point.
              </li>
              <li>
                <strong>Denari:</strong> &gt; 5 denari suit cards = 1 point.
              </li>
              <li>
                <strong>Settebello:</strong> capture the 7♦ = 1 point.
              </li>
              <li>
                <strong>Primiera:</strong> best card per suit according to the
                scale below:
                <table style={{ width: "100%", marginTop: "0.5rem" }}>
                  <thead>
                    <tr>
                      <th>Card</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>7</td><td>21</td></tr>
                    <tr><td>6</td><td>18</td></tr>
                    <tr><td>Ace (1)</td><td>16</td></tr>
                    <tr><td>5</td><td>15</td></tr>
                    <tr><td>4</td><td>14</td></tr>
                    <tr><td>3</td><td>13</td></tr>
                    <tr><td>2</td><td>12</td></tr>
                    <tr><td>8,9,10</td><td>10</td></tr>
                  </tbody>
                </table>
              </li>
              <li>
                Missing any suit = 0 primiera. Higher primiera = 1 point.
              </li>
              <li>
                <strong>Scopa:</strong> each table‐emptying capture = 1 point.
              </li>
              <li>
                <strong>Total:</strong> sum of Cards + Denari + Settebello +
                Primiera + Scopa.
              </li>
            </ul>
          </Panel>

          <Panel header="End-of-Game Process" key="5">
            <ul>
              <li>The game lasts exactly 36 turns.</li>
              <li>No scopa on the final capture, even if table empties.</li>
              <li>
                Remaining table cards go to the last capturing player after
                turn 36.
              </li>
              <li>Final scores decide the winner.</li>
            </ul>
          </Panel>

          <Panel header="Team Play" key="6">
            <p>
              Players seated alternately (1 & 3 vs. 2 & 4) form teams. Teammates’
              captured cards combine for scoring.
            </p>
          </Panel>

          <Panel header="Conclusion" key="7">
            <p>
              Thats Scopa in a nutshell: 4 cards on the table, 9 in your hand,
              capture or add to the table, score points, and repeat for 36 turns.
            </p>
            <p>
              Good luck and may the best scopa‐player win!
            </p>
          </Panel>
        </Collapse>
      </div>
    </div>
  );
}