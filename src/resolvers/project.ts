import { Project } from "../entities/Project";
import { Resolver, Query, Ctx, Arg, Mutation } from "type-graphql";
import { PsContext } from "src/types";

@Resolver()
export class ProjectResolver {
    @Query(() => [Project])
    projects(
        @Ctx() { em }: PsContext
    ): Promise<Project[]> {
        return em.find(Project, {})
    }

    @Query(() => Project, { nullable: true })
    project(
        @Arg('id', () => String) id: string,
        @Ctx() { em }: PsContext
    ): Promise<Project | null> {
        return em.findOne(Project, { id })
    }

    @Mutation(() => Project)
    async createProject(
        @Arg('title', () => String) title: string,
        @Arg('description', () => String) description: string,
        @Ctx() { em }: PsContext
    ): Promise<Project> {
        const project = em.create(Project, { title, description })
        await em.persistAndFlush(project)

        return project
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id', () => String) id: string,
        @Ctx() { em }: PsContext
    ): Promise<Boolean> {
        try {
            await em.nativeDelete(Project, { id })
            return true
        } catch {
            return false
        }
    }

    // @Mutation(() => Project, { nullable: true })
    // async updateProject(
    //     @Arg('id', () => String) id: string,
    //     @Arg('payload', () => ObjectType) payload: Project,
    //     @Ctx() { em }: PsContext
    // ): Promise<Project | null> {
    //     const project = await em.findOne(Project, { id })
    //     if (!project) {
    //         return null
    //     }

    //     let key: keyof typeof payload
    //     for (key in payload) {
    //         const value = payload[key]
    //         if (typeof value !== undefined && (typeof key === typeof value)) {
    //             project[key] = value
    //         }
    //     }
    //     Object.keys(payload).forEach((key: string | number) => {
    //         const val: any = payload[key]
    //     })
    //     project.title = title
    //     await em.persistAndFlush(project)

    //     return project
    // }
}
