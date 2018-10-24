import {resourcesReducer} from "..";
import normalizedJsonApiChecklistsPayload
  from "../__testHelpers__/fixtures/normalizedJsonApiChecklistsPayload";
import normalizedJsonApiTasksPayload
  from "../__testHelpers__/fixtures/normalizedJsonApiTasksPayload";
import hugeNormalizedJsonApiChecklistsPayload
  from "../__testHelpers__/fixtures/hugeNormalizedJsonApiChecklistsPayload";

describe("post reducer", () => {
  describe("UPDATE_RESOURCES", () => {
    it("should return the initial state", () => {
      expect(resourcesReducer(undefined, {})).toEqual({ index: {} });
    });
    it("should update the store given a UPDATE_RESOURCES action", () => {
      const checklistsMergeResourcesAction = {
        resourceType: "tasks",
        resourcesById: normalizedJsonApiChecklistsPayload,
        type: "UPDATE_RESOURCES",
        index: [6,5,4,3,2,1]
      };
      expect(resourcesReducer({ index: {} }, checklistsMergeResourcesAction)).toEqual({
        tasks: normalizedJsonApiChecklistsPayload,
        index: {
          tasks: [6,5,4,3,2,1]
        }
      });
    });
    it("should handle multiple resources given multiple UPDATE_RESOURCES", () => {
      const checklistsMergeResourcesAction = {
        resourceType: "checklists",
        resourcesById: normalizedJsonApiChecklistsPayload,
        type: "UPDATE_RESOURCES",
        index: [1,2,3]
      };
      const tasksMergeResourcesAction = {
        resourceType: "tasks",
        resourcesById: normalizedJsonApiTasksPayload,
        type: "UPDATE_RESOURCES",
        index: [1,2,3,4,5,6]
      };
      const firstUpdatedState = resourcesReducer(
        { index: {} },
        checklistsMergeResourcesAction
      );
      expect(
        resourcesReducer(firstUpdatedState, tasksMergeResourcesAction)
      ).toEqual({
        checklists: normalizedJsonApiChecklistsPayload,
        tasks: normalizedJsonApiTasksPayload,
        index: {
          checklists: [1,2,3],
          tasks: [1,2,3,4,5,6],
        }
      });
    });
    it("should handle multiple updates with the same resources", () => {
      const checklistsMergeResourcesAction = {
        resourceType: "checklists",
        resourcesById: normalizedJsonApiChecklistsPayload,
        type: "UPDATE_RESOURCES",
        index: [1,2,3],
      };
      const firstUpdatedState = resourcesReducer(
        { index: { checklists: [3,2,1] } },
        checklistsMergeResourcesAction
      );
      expect(
        resourcesReducer(firstUpdatedState, checklistsMergeResourcesAction)
      ).toEqual({
        checklists: normalizedJsonApiChecklistsPayload,
        index: { checklists: [3,2,1] }
      });
    });
    it("benchmark small payload", async () => {
      await smallPayloadReducerCall();
    });
    it("benchmark huge payload", async () => {
      await hugePayloadReducerCall();
    });
  });

  describe("ADD_OR_REPLACE_RESOURCE_BY_ID", () => {
    it("should update the store given a ADD_OR_REPLACE_RESOURCE_BY_ID action", () => {
      const checklist = {
        id: 1,
        type: "checklists",
        attributes: {name: "Onboarding Rest"},
        links: {self: "http://example.com/checklists/1"},
        relationships: {
          tasks: {data: [{id: 1, type: "tasks"}, {id: 2, type: "tasks"}]}
        }
      };

      const updateAction = {
        type: "ADD_OR_REPLACE_RESOURCE_BY_ID",
        resourceType: checklist.type,
        id: checklist.id,
        attributes: checklist.attributes,
        links: checklist.links,
        relationships: checklist.relationships
      };

      expect(resourcesReducer({index: {}}, updateAction)).toEqual({
        checklists: {[checklist.id]: checklist},
        index: { checklists: [1] },
      });
      expect(
        resourcesReducer({index: { checklists: [1] }}, {...updateAction, attributes: {name: "changed"}})
      ).toEqual({
        checklists: {
          [checklist.id]: {...checklist, attributes: {name: "changed"}},
        },
        index: { checklists: [1] },
      });
    });

    it("update to existing should not impact order ADD_OR_REPLACE_RESOURCE_BY_ID action", () => {
      const checklist = {
        id: 1,
        type: "checklists",
        attributes: {name: "Onboarding Rest"},
        links: {self: "http://example.com/checklists/1"},
        relationships: {
          tasks: {data: [{id: 1, type: "tasks"}, {id: 2, type: "tasks"}]}
        }
      };

      const updateAction = {
        type: "ADD_OR_REPLACE_RESOURCE_BY_ID",
        resourceType: checklist.type,
        id: checklist.id,
        attributes: checklist.attributes,
        links: checklist.links,
        relationships: checklist.relationships
      };

      expect(
        resourcesReducer({index: { checklists: [2,1,3] }}, {...updateAction, attributes: {name: "changed"}})
      ).toEqual({
        checklists: {
          [checklist.id]: {...checklist, attributes: {name: "changed"}},
        },
        index: { checklists: [2,1,3] },
      });
    });
  });

  describe("REMOVE_RESOURCE_BY_ID", () => {
    it("should remove a resource from the store", () => {
      const initialState = {
        checklists: normalizedJsonApiChecklistsPayload,
        index: {
          checklists: [1,2,3],
        }
      };
      const checklist = normalizedJsonApiChecklistsPayload[1];
      expect(checklist.id).toEqual(1);

      const removeAction = {
        type: "REMOVE_RESOURCE_BY_ID",
        resourceType: checklist.type,
        id: checklist.id
      };
      const state = resourcesReducer(initialState, removeAction);
      expect(state[checklist.type][checklist.id]).toBeUndefined();
      expect(state.index.checklists.indexOf(checklist.id)).toBe(-1);
      expect(Object.values(state[checklist.type]).length).toEqual(2);
    });
  });

  describe("REMOVE_RESOURCES_BY_ID", () => {
    it("should remove multiple resources from the store", () => {
      const initialState = {
        checklists: normalizedJsonApiChecklistsPayload,
        index: {
          checklists: [1,2,3],
        }
      };

      const checklist1 = normalizedJsonApiChecklistsPayload[1];
      const checklist2 = normalizedJsonApiChecklistsPayload[2];
      const checklist3 = normalizedJsonApiChecklistsPayload[3];

      const resources = [checklist1, checklist2];

      const removeResourcesAction = {
        type: "REMOVE_RESOURCES_BY_ID",
        resources
      };
      const state = resourcesReducer(initialState, removeResourcesAction);
      expect(state[checklist1.type][1]).toBeUndefined();
      expect(state[checklist2.type][2]).toBeUndefined();
      expect(state[checklist3.type][3]).toEqual(checklist3);
      expect(state.index.checklists).toEqual([3]);
      expect(Object.values(state[checklist1.type]).length).toEqual(1);
    });
  });

  describe("CLEAR_RESOURCES", () => {
    it("should clear resources from the store", () => {
      const initialState = {
        checklists: normalizedJsonApiChecklistsPayload,
        index: {
          checklists: [1,2,3],
        }
      };

      const removeAction = {
        type: "CLEAR_RESOURCES",
        resourceTypes: ["checklists"]
      };
      const state = resourcesReducer(initialState, removeAction);
      expect(state).toEqual({
        checklists: {},
        index: {
          checklists: [],
        },
      });
    });

    it("should clear single resource from the store and leave the others", () => {
      const initialState = {
        checklists: normalizedJsonApiChecklistsPayload,
        tasks: normalizedJsonApiTasksPayload,
        index: {
          checklists: [1,2,3],
          tasks: [1,2,3,4,5,6],
        }
      };

      const removeAction = {
        type: "CLEAR_RESOURCES",
        resourceTypes: ["checklists"]
      };
      const state = resourcesReducer(initialState, removeAction);
      expect(state).toEqual({
        checklists: {},
        tasks: normalizedJsonApiTasksPayload,
        index: {
          checklists: [],
          tasks: [1,2,3,4,5,6],
        },
      });
    });

    it("should clear multiple resources from the store", () => {
      const initialState = {
        checklists: normalizedJsonApiChecklistsPayload,
        tasks: normalizedJsonApiTasksPayload,
        index: {
          checklists: [1,2,3],
          tasks: [1,2,3,4,5,6],
        }
      };

      const removeAction = {
        type: "CLEAR_RESOURCES",
        resourceTypes: ["checklists", "tasks"]
      };
      const state = resourcesReducer(initialState, removeAction);
      expect(state).toEqual({
        checklists: {},
        tasks: {},
        index: {
          checklists: [],
          tasks: [],
        },
      });
    });
  });
});

function smallPayloadReducerCall() {
  return new Promise((resolve, reject) => {
    // increase this count to benchmark
    const itterationCount = 1;
    const array = Array(itterationCount).fill();
    array.forEach((n, index) => {
      const checklistsMergeResourcesAction = {
        resourceType: "checklists",
        resourcesById: normalizedJsonApiChecklistsPayload,
        type: "UPDATE_RESOURCES",
        index: [],
      };

      const firstUpdatedState = resourcesReducer(
        { index: {} },
        checklistsMergeResourcesAction
      );
      if (index === array.length - 1) resolve(firstUpdatedState);
    });
  });
}

function hugePayloadReducerCall() {
  return new Promise((resolve, reject) => {
    // increase this count to benchmark
    const itterationCount = 1;
    const array = Array(itterationCount).fill();
    array.forEach((n, index) => {
      const checklistsMergeResourcesAction = {
        resourceType: "checklists",
        resourcesById: hugeNormalizedJsonApiChecklistsPayload,
        type: "UPDATE_RESOURCES",
        index: [],
      };

      const firstUpdatedState = resourcesReducer(
        { index: {} },
        checklistsMergeResourcesAction
      );
      if (index === array.length - 1) resolve();
    });
  });
}
