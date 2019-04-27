import jsonApiPayload
  from "../__testHelpers__/fixtures/checklistsJsonApiResponse";
import graphQlPayload
  from "../__testHelpers__/fixtures/checklistsGraphQlResponse";
import normalizedJsonApiTasksPayload
  from "../__testHelpers__/fixtures/normalizedJsonApiTasksPayload";
import normalizedJsonApiChecklistsPayload
  from "../__testHelpers__/fixtures/normalizedJsonApiChecklistsPayload";
import normalizedGraphQlTaskPayload
  from "../__testHelpers__/fixtures/normalizedGraphQlTasksPayload";
import normalizedGraphQlChecklistPayload
  from "../__testHelpers__/fixtures/normalizedGraphQlChecklistsPayload";

import {Actions} from "../../blue-chip";
import reduxAdapter from "../";
const dispatch = jest.fn().mockName("dispatch");
const actions = Actions.config({
  adapter: reduxAdapter,
  mutator: dispatch
});

describe("Redux Actions", () => {
  describe("updateResources", () => {
    describe("JsonApi", () => {
      test("dispatches UPDATE_RESOURCES for each ", () => {
        const tasksMergeResourcesAction = {
          index: [1, 2, 3],
          resourcesByType: { tasks: normalizedJsonApiTasksPayload },
          type: "UPDATE_RESOURCES"
        };

        const checklistsMergeResourcesAction = {
          index: [1, 2, 3],
          resourcesByType: { checklists: normalizedJsonApiChecklistsPayload },
          type: "UPDATE_RESOURCES"
        };

        actions.updateResources(jsonApiPayload);
        expect(dispatch).toMatchSnapshot();
      });
    });

    describe("GraphQl", () => {
      test("dispatches UPDATE_RESOURCES for each ", () => {
        const tasksMergeResourcesAction = {
          index: [],
          resourcesByType: { tasks: normalizedGraphQlTaskPayload },
          type: "UPDATE_RESOURCES"
        };

        const checklistsMergeResourcesAction = {
          index: [],
          resourcesByType: { checklists: normalizedGraphQlChecklistPayload },
          type: "UPDATE_RESOURCES"
        };

        actions.updateResources(graphQlPayload);
        expect(dispatch).toMatchSnapshot();
      });
    });
  });

  describe("updateResource", () => {
    test("dispatches update action for a single resource", () => {
      const checklist = {
        id: 1,
        type: "checklists",
        attributes: {name: "Onboarding Rest"},
        links: {self: "http://example.com/checklists/1"},
        relationships: {
          tasks: {
            data: [{id: 1, type: "tasks"}, {id: 2, type: "tasks"}]
          }
        }
      };

      const updateAction = {
        type: "UPDATE_RESOURCE_BY_ID",
        resourceType: checklist.type,
        id: checklist.id,
        attributes: checklist.attributes,
        links: checklist.links,
        relationships: checklist.relationships
      };

      actions.updateResource(checklist);
      expect(dispatch).toBeCalledWith(updateAction);
    });
  });

  describe("removeResources", () => {
    test("dispatches remove resource action", () => {
      const checklists = [
        {
          id: 1,
          type: "checklists"
        },
        {
          id: 2,
          type: "checklists"
        }
      ];

      const removeResourcesAction = {
        type: "REMOVE_RESOURCES_BY_ID",
        resources: checklists
      };

      actions.removeResources(checklists);
      expect(dispatch).toBeCalledWith(removeResourcesAction);
    });
  });

  describe("removeResource", () => {
    test("dispatches remove resource action", () => {
      const checklist = {
        id: 1,
        type: "checklists"
      };

      const deleteAction = {
        type: "REMOVE_RESOURCE_BY_ID",
        resourceType: checklist.type,
        id: checklist.id
      };

      actions.removeResource(checklist);
      expect(dispatch).toBeCalledWith(deleteAction);
    });
  });

  describe("clearResources", () => {
    test("clears the store for the provided resources", () => {
      const resourceTypes = ["checklists", "tasks"];

      const clearResourcesAction = {
        type: "CLEAR_RESOURCES",
        resourceTypes
      };

      actions.clearResources(resourceTypes, dispatch);
      expect(dispatch).toBeCalledWith(clearResourcesAction);
    });
  });
});
