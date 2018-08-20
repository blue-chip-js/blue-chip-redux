import {resourcesReducer} from "..";
import normalizedJsonApiChecklistsPayload
  from "../__testHelpers__/fixtures/normalizedJsonApiChecklistsPayload";
import normalizedJsonApiTasksPayload
  from "../__testHelpers__/fixtures/normalizedJsonApiTasksPayload";
import hugeNormalizedJsonApiChecklistsPayload
  from "../__testHelpers__/fixtures/hugeNormalizedJsonApiChecklistsPayload";

const addIndex = resources =>
  Object.entries(resources).reduce((resources, [id, resource], __index) => {
    resources[id] = {
      ...resource,
      __index
    };
    return resources;
  }, {});

describe("resources reducer", () => {
  describe("UPDATE_RESOURCES", () => {
    it("should return the initial state", () => {
      expect(resourcesReducer(undefined, {})).toEqual({});
    });

    it("should update the store given a UPDATE_RESOURCES action", () => {
      const checklistsMergeResourcesAction = {
        resourceType: "tasks",
        resourcesById: normalizedJsonApiChecklistsPayload,
        type: "UPDATE_RESOURCES"
      };
      expect(resourcesReducer({}, checklistsMergeResourcesAction)).toEqual({
        tasks: addIndex(normalizedJsonApiChecklistsPayload)
      });
    });

    it("should handle multiple resources given multiple UPDATE_RESOURCES", () => {
      const checklistsMergeResourcesAction = {
        resourceType: "checklists",
        resourcesById: normalizedJsonApiChecklistsPayload,
        type: "UPDATE_RESOURCES"
      };
      const tasksMergeResourcesAction = {
        resourceType: "tasks",
        resourcesById: normalizedJsonApiTasksPayload,
        type: "UPDATE_RESOURCES"
      };
      const firstUpdatedState = resourcesReducer(
        {},
        checklistsMergeResourcesAction
      );
      expect(
        resourcesReducer(firstUpdatedState, tasksMergeResourcesAction)
      ).toEqual({
        checklists: addIndex(normalizedJsonApiChecklistsPayload),
        tasks: addIndex(normalizedJsonApiTasksPayload)
      });
    });

    it("should handle multiple updates with the same resources", () => {
      const checklistsMergeResourcesAction = {
        resourceType: "checklists",
        resourcesById: normalizedJsonApiChecklistsPayload,
        type: "UPDATE_RESOURCES"
      };
      const firstUpdatedState = resourcesReducer(
        {},
        checklistsMergeResourcesAction
      );
      expect(
        resourcesReducer(firstUpdatedState, checklistsMergeResourcesAction)
      ).toEqual({checklists: addIndex(normalizedJsonApiChecklistsPayload)});
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

      expect(resourcesReducer({}, updateAction)).toEqual({
        checklists: {[checklist.id]: checklist}
      });
      expect(
        resourcesReducer({}, {...updateAction, attributes: {name: "changed"}})
      ).toEqual({
        checklists: {
          [checklist.id]: {...checklist, attributes: {name: "changed"}}
        }
      });
    });
  });

  describe("REMOVE_RESOURCE_BY_ID", () => {
    it("should remove a resource from the store", () => {
      const initialState = {
        checklists: normalizedJsonApiChecklistsPayload
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
      expect(Object.values(state[checklist.type]).length).toEqual(2);
    });
  });

  describe("REMOVE_RESOURCES_BY_ID", () => {
    it("should remove multiple resources from the store", () => {
      const initialState = {
        checklists: normalizedJsonApiChecklistsPayload
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
      expect(Object.values(state[checklist1.type]).length).toEqual(1);
    });
  });

  describe("CLEAR_RESOURCES", () => {
    it("should clear resources from the store", () => {
      const initialState = {
        checklists: normalizedJsonApiChecklistsPayload
      };

      const removeAction = {
        type: "CLEAR_RESOURCES",
        resourceTypes: ["checklists"]
      };
      const state = resourcesReducer(initialState, removeAction);
      expect(state["checklists"]).toEqual({});
    });

    it("should clear single resource from the store and leave the others", () => {
      const initialState = {
        checklists: normalizedJsonApiChecklistsPayload,
        tasks: normalizedJsonApiTasksPayload
      };

      const removeAction = {
        type: "CLEAR_RESOURCES",
        resourceTypes: ["checklists"]
      };
      const state = resourcesReducer(initialState, removeAction);
      expect(state).toEqual({
        checklists: {},
        tasks: normalizedJsonApiTasksPayload
      });
    });

    it("should clear multiple resources from the store", () => {
      const initialState = {
        checklists: normalizedJsonApiChecklistsPayload,
        tasks: normalizedJsonApiTasksPayload
      };

      const removeAction = {
        type: "CLEAR_RESOURCES",
        resourceTypes: ["checklists", "tasks"]
      };
      const state = resourcesReducer(initialState, removeAction);
      expect(state).toEqual({
        checklists: {},
        tasks: {}
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
        type: "UPDATE_RESOURCES"
      };

      const firstUpdatedState = resourcesReducer(
        {},
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
        type: "UPDATE_RESOURCES"
      };

      const firstUpdatedState = resourcesReducer(
        {},
        checklistsMergeResourcesAction
      );
      if (index === array.length - 1) resolve();
    });
  });
}
