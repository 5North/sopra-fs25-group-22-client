"use client";

import { useEffect, useState } from "react";
import { Collapse } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";

const { Panel } = Collapse;

const ScopaInstructions: React.FC = () => {
  return (
    <div className="register-container" style={{ paddingBottom: "2rem" }}>

      <h2 style={{ textAlign: "center", color: "#fff", marginBottom: "2rem" }}>
        Hi, it's great to see you're curious about how to play Scopa! 🤓
      </h2>

      <Collapse
        accordion
        style={{ width: "80%", margin: "0 auto", fontSize: "1.1rem" }}
      >
        <Panel header="Game Setup" key="1">
          <ul>
            <li>At the start, 4 cards are placed on the table.</li>
            <li>Each player receives 9 cards.</li>
            <li>
              Players take seats in a circle. Players sitting in alternating positions form teams
              (e.g., player 1 and player 3 form one team, while player 2 and player 4 form the other team).
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
                  <strong>Deterministic Capture:</strong> If there is exactly one matching option
                  (for example, a single card on the table that has the same value as your played card),
                  that option is applied automatically.
                </li>
                <li>
                  <strong>Non-deterministic Capture:</strong> If several capture combinations are
                  available, you will be prompted to choose one.
                </li>
                <li>
                  <strong>No Capture:</strong> If no capture option is available, your played card
                  is simply added to the table.
                </li>
              </ul>
            </li>
            <li>
              If a capture occurs, you collect both the card you played and the cards captured from
              the table. The collected cards become part of your team treasure (which is the aggregate
              of both teammates’ captured cards).
            </li>
            <li>
              If the table becomes empty after a capture (except in the last turn), this is counted
              as a scopa, awarding you an extra point.
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
                  Rule: If you play a card that exactly matches a single card on the table,
                  you must capture that card.
                </li>
                <li>
                  Example: You play a 7 and there is a single 7 on the table. You capture that 7
                  automatically (even if there are also a 4 and a 3 that sums to 7).
                </li>
              </ul>
            </li>
            <li>
              <strong>Non-Deterministic Capture</strong>
              <ul>
                <li>
                  Rule: If there is no single matching card, you may capture a combination of cards
                  whose values sum to the played card.
                </li>
                <li>
                  Example: You play a 7. On the table, there is no single 7, but there are two
                  possible options:
                </li>
                <ul>
                  <li>Option A: A 3 and a 4 (3 + 4 = 7).</li>
                  <li>Option B: Two 2’s and a 3 (2 + 2 + 3 = 7).</li>
                </ul>
                <li>In this case, you will be prompted to choose one of the available combinations.</li>
              </ul>
            </li>
            <li>
              <strong>Special Scenario: Multiple Identical Cards</strong>
              <ul>
                <li>
                  Rule: If there are multiple identical cards on the table that match your played
                  card, you may choose which one to capture.
                </li>
                <li>
                  Example: You play a 7 and there are two 7’s on the table. You can choose which 7
                  to capture.
                </li>
              </ul>
            </li>
            <li>
              <strong>No Capture Option</strong>
              <ul>
                <li>
                  Rule: If no combination of cards on the table matches your played card’s value,
                  your card is added to the table.
                </li>
                <li>
                  Example: You play a 4 but the table has no cards or combinations that sum up to 4.
                  The played card remains on the table.
                </li>
              </ul>
            </li>
          </ol>
        </Panel>

        <Panel header="Scoring Rules" key="4">
          <ul>
            <li>
              <strong>Cards:</strong> If a team collects more than 20 cards (combining the captured cards
              of both teammates), they earn 1 point.
            </li>
            <li>
              <strong>Denari:</strong> If a team collects more than 5 cards of the Denari suit, they earn 1 point.
            </li>
            <li>
              <strong>Settebello:</strong> Capturing the 7 of Denari earns 1 point.
            </li>
            <li>
              <strong>Primiera:</strong> For each suit, the best card is chosen according to this scale:
              <table>
                <thead>
                  <tr>
                    <th>Card</th>
                    <th>Primiera Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>7</td>
                    <td>21</td>
                  </tr>
                  <tr>
                    <td>6</td>
                    <td>18</td>
                  </tr>
                  <tr>
                    <td>Ace (1)</td>
                    <td>16</td>
                  </tr>
                  <tr>
                    <td>5</td>
                    <td>15</td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>14</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>13</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>12</td>
                  </tr>
                  <tr>
                    <td>8, 9, 10</td>
                    <td>10</td>
                  </tr>
                </tbody>
              </table>
            </li>
            <li>
              The team must have at least one card from each of the 4 suits. If any suit is missing,
              the primiera score is 0.
            </li>
            <li>
              The team with the higher total primiera score earns 1 point.
            </li>
            <li>
              <strong>Scopa:</strong> Each time a capture empties the table (except on the last turn),
              it is counted as a scopa and gives 1 point.
            </li>
            <li>
              <strong>Total Score:</strong> The total team score is the sum of the fixed points from
              Cards, Denari, Settebello, and Primiera plus the number of scopa points.
            </li>
          </ul>
        </Panel>

        <Panel header="End-of-Game Process" key="5">
          <ul>
            <li>The game lasts for 36 turns.</li>
            <li>In the final turn, even if the table is emptied, no scopa point is awarded.</li>
            <li>After the last turn, any remaining cards on the table are automatically collected by
              the last player who made a capture.</li>
            <li>The final scores of the teams are then compared to determine the winner.</li>
          </ul>
        </Panel>

        <Panel header="Team Play" key="6">
          <p>
            Players seated in alternating positions form teams (for example, players 1 and 3 are on
            the same team, while players 2 and 4 are on the opposing team). When calculating team
            scores, the captured cards from both teammates are combined. The final outcome (win, loss,
            or tie) is determined by comparing the total points of both teams.
          </p>
        </Panel>

        <Panel header="Conclusion" key="7">
          <div>
            <p>
              The game starts with 4 cards on the table and 9 cards per player. Players take turns
              playing cards. Depending on the cards on the table, a capture may occur automatically
              or you may need to choose between several options. Points are awarded based on the
              number of cards collected, the number of Denari, capturing the 7 of Denari, achieving
              the best Primiera, and the number of scopa.
            </p>
            <p>
              The game ends after 36 turns, with any remaining cards on the table assigned to the last
              capturing player.
            </p>
            <p>
              This overview provides the pure rules for playing the game, intended for the user
              interface design without revealing any internal implementation details.
            </p>
          </div>
        </Panel>
      </Collapse>
    </div>
  );
};

export default ScopaInstructions;


